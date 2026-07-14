import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE = "https://api.paidlyinteractive.com";
const MERCHANT_ID = process.env.CATALYSTPAY_MERCHANT_ID ?? "";
const API_TOKEN = process.env.CATALYSTPAY_API_TOKEN ?? "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { amount, orderId, returnUrl } = req.body as {
    amount: string;
    orderId: string;
    returnUrl: string;
  };

  if (!amount || !orderId || !returnUrl)
    return res.status(400).json({ error: "Missing required fields" });

  if (!MERCHANT_ID || !API_TOKEN)
    return res.status(500).json({ error: "Payment provider not configured" });

  const body = {
    amount: String(parseFloat(amount).toFixed(2)),
    currency: "USD",
    metadata: { orderId },
    checkout: {
      redirectURL: `${returnUrl}?invoiceId={InvoiceId}`,
      redirectAutomatically: true,
    },
  };

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
    return res.status(502).json({ error: "Payment provider error", detail: errText });
  }

  const invoice = (await response.json()) as { id: string; checkoutLink: string };
  return res.json({ checkoutLink: invoice.checkoutLink, invoiceId: invoice.id });
}
