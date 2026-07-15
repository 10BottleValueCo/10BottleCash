import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const API_BASE  = "https://api.paidlyinteractive.com";
const API_TOKEN = process.env.CATALYSTPAY_API_TOKEN ?? "";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { invoiceId } = req.query as { invoiceId: string };

  try {
    const response = await fetch(`${API_BASE}/api/v1/invoices/${invoiceId}`, {
      headers: { Authorization: `Token ${API_TOKEN}` },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch invoice" });
    }

    const invoice = (await response.json()) as {
      id: string;
      status: string;
      metadata?: { orderId?: string };
    };

    // Also look up orderId from Supabase by invoice_id (more reliable than in-memory map)
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("invoice_id", invoiceId)
      .single();

    const orderId = order?.id ?? invoice.metadata?.orderId ?? null;

    return res.status(200).json({
      invoiceId,
      status: invoice.status,
      orderId,
    });
  } catch (err) {
    console.error("[payments/status] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
