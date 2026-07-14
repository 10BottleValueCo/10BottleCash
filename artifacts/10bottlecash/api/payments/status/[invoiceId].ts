import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE = "https://api.paidlyinteractive.com";
const API_TOKEN = process.env.CATALYSTPAY_API_TOKEN ?? "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { invoiceId } = req.query as { invoiceId: string };

  const response = await fetch(
    `${API_BASE}/api/v1/invoices/${invoiceId}`,
    { headers: { Authorization: `Token ${API_TOKEN}` } }
  );

  if (!response.ok)
    return res.status(502).json({ error: "Failed to fetch invoice" });

  const invoice = (await response.json()) as {
    id: string;
    status: string;
    metadata?: { orderId?: string };
  };

  return res.json({
    invoiceId,
    status: invoice.status,
    orderId: invoice.metadata?.orderId ?? null,
  });
}
