import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

const API_BASE      = "https://api.paidlyinteractive.com";
const API_TOKEN     = process.env.CATALYSTPAY_API_TOKEN ?? "";
const WEBHOOK_SECRET = process.env.CATALYSTPAY_WEBHOOK_SECRET ?? "";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
);

function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return true; // skip if not configured
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  return signature === expected;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = (req.headers["x-signature"] ?? "") as string;
  const rawBody = JSON.stringify(req.body);
  if (WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    console.warn("[webhook] invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  try {
    const event = req.body as {
      type?: string;
      invoiceId?: string;
      metadata?: { orderId?: string };
    };

    console.log("[webhook] received:", JSON.stringify(event));

    const invoiceId = event.invoiceId;
    if (!invoiceId) {
      return res.status(200).json({ ok: true });
    }

    const r = await fetch(`${API_BASE}/api/v1/invoices/${invoiceId}`, {
      headers: { Authorization: `Token ${API_TOKEN}` },
    });

    if (!r.ok) {
      console.error("[webhook] failed to fetch invoice:", invoiceId);
      return res.status(200).json({ ok: true });
    }

    const inv = (await r.json()) as {
      status: string;
      metadata?: { orderId?: string };
    };

    const orderId = event.metadata?.orderId ?? inv.metadata?.orderId;

    const settled = ["Settled", "Complete", "settled"].includes(inv.status);
    const failed  = ["Expired", "Invalid", "expired", "invalid"].includes(inv.status);

    if (orderId && (settled || failed)) {
      const newStatus = settled ? "Completed" : "Unpaid";
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      if (error) console.error("[webhook] supabase error:", error.message);
      else console.log(`[webhook] order ${orderId} → ${newStatus}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[webhook] error:", err);
    return res.status(200).json({ ok: true });
  }
}
