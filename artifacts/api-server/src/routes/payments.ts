import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";

const router = Router();

const API_BASE = "https://api.paidlyinteractive.com";
const MERCHANT_ID = process.env.CATALYSTPAY_MERCHANT_ID ?? "";
const API_TOKEN = process.env.CATALYSTPAY_API_TOKEN ?? "";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
);

// In-memory map: invoiceId → { orderId }
const invoiceMap = new Map<string, { orderId: string }>();

// POST /api/payments/create
router.post("/payments/create", async (req, res) => {
  try {
    const { amount, orderId, returnUrl } = req.body as {
      amount: string;
      orderId: string;
      returnUrl: string;
    };

    if (!amount || !orderId || !returnUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!MERCHANT_ID || !API_TOKEN) {
      logger.error("CatalystPay credentials not configured");
      res.status(500).json({ error: "Payment provider not configured" });
      return;
    }

    const body = {
      amount: String(parseFloat(amount).toFixed(2)),
      currency: "USD",
      metadata: { orderId },
      checkout: {
        redirectURL: `${returnUrl}?invoiceId={InvoiceId}`,
        redirectAutomatically: true,
      },
    };

    logger.info({ body, storeId: MERCHANT_ID }, "Creating PaidlyInteractive invoice");

    const response = await fetch(
      `${API_BASE}/api/v1/stores/${MERCHANT_ID}/invoices`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${API_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ status: response.status, errText }, "Invoice creation failed");
      res.status(502).json({ error: "Payment provider error", detail: errText });
      return;
    }

    const invoice = (await response.json()) as { id: string; checkoutLink: string };
    invoiceMap.set(invoice.id, { orderId });

    logger.info({ invoiceId: invoice.id, orderId }, "Invoice created");
    res.json({ checkoutLink: invoice.checkoutLink, invoiceId: invoice.id });
  } catch (err) {
    logger.error({ err }, "payments/create error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/payments/status/:invoiceId
router.get("/payments/status/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const response = await fetch(
      `${API_BASE}/api/v1/invoices/${invoiceId}`,
      {
        headers: { Authorization: `Token ${API_TOKEN}` },
      }
    );

    if (!response.ok) {
      res.status(502).json({ error: "Failed to fetch invoice" });
      return;
    }

    const invoice = (await response.json()) as { id: string; status: string; metadata?: { orderId?: string } };
    const mapping = invoiceMap.get(invoiceId);

    // orderId can come from in-memory map or from invoice metadata
    const orderId = mapping?.orderId ?? invoice.metadata?.orderId ?? null;

    res.json({
      invoiceId,
      status: invoice.status, // "New" | "Processing" | "Expired" | "Invalid" | "Settled"
      orderId,
    });
  } catch (err) {
    logger.error({ err }, "payments/status error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/payments/webhook  (PaidlyInteractive → us)
router.post("/payments/webhook", async (req, res) => {
  try {
    const event = req.body as {
      type?: string;
      invoiceId?: string;
      metadata?: { orderId?: string };
    };

    logger.info({ event }, "Webhook received");

    const invoiceId = event.invoiceId;
    if (!invoiceId) {
      res.json({ ok: true });
      return;
    }

    // Fetch real status from PaidlyInteractive
    let providerStatus = "";
    try {
      const r = await fetch(`${API_BASE}/api/v1/invoices/${invoiceId}`, {
        headers: { Authorization: `Token ${API_TOKEN}` },
      });
      if (r.ok) {
        const inv = (await r.json()) as {
          status: string;
          metadata?: { orderId?: string };
        };
        providerStatus = inv.status;

        // Resolve orderId from in-memory map or invoice metadata
        const mapping = invoiceMap.get(invoiceId);
        const orderId = mapping?.orderId ?? event.metadata?.orderId ?? inv.metadata?.orderId;

        if (orderId) {
          const settled =
            providerStatus === "Settled" ||
            providerStatus === "Complete" ||
            providerStatus === "settled";
          const failed =
            providerStatus === "Expired" ||
            providerStatus === "Invalid" ||
            providerStatus === "expired" ||
            providerStatus === "invalid";

          if (settled || failed) {
            const newStatus = settled ? "Completed" : "Unpaid";
            const { error } = await supabase
              .from("orders")
              .update({ status: newStatus })
              .eq("id", orderId);

            if (error) {
              logger.error({ error, orderId, newStatus }, "Supabase update failed in webhook");
            } else {
              logger.info({ orderId, newStatus }, "Order status updated via webhook");
            }
          }
        }
      }
    } catch (fetchErr) {
      logger.error({ fetchErr }, "Failed to fetch invoice status in webhook");
    }

    res.json({ ok: true });
  } catch (err) {
    logger.status(400).json({ error: "Invalid webhook payload" });
  }
});

export default router;
