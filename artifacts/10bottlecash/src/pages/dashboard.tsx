import { Link } from "wouter";
import { Logo } from "@/components/logo";

const mockOrders = [
  { id: "ORD-001", supplier: "Valley Distributors", amount: "$1,240.00", status: "Completed", date: "Jul 14, 2026" },
  { id: "ORD-002", supplier: "West Coast Supply", amount: "$875.50",  status: "Pending",   date: "Jul 13, 2026" },
  { id: "ORD-003", supplier: "Metro Beverages",   amount: "$3,100.00", status: "Completed", date: "Jul 12, 2026" },
  { id: "ORD-004", supplier: "Sunrise Imports",   amount: "$560.00",  status: "Processing", date: "Jul 11, 2026" },
  { id: "ORD-005", supplier: "Golden Gate Co.",   amount: "$2,450.75", status: "Completed", date: "Jul 10, 2026" },
];

const statusColor: Record<string, string> = {
  Completed:  "#22c55e",
  Pending:    "#F5A623",
  Processing: "#60a5fa",
};

export function Dashboard() {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          <Logo className="w-14 h-14" />
          <span style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.18em", fontSize: "14px", color: "#c8c8c8", fontWeight: 400, textTransform: "uppercase", marginLeft: "-10px" }}>
            10BOTTLECASH
          </span>
        </div>
        <Link
          href="/"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", cursor: "pointer" }}
        >
          Sign Out
        </Link>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "40px 32px" }}>

        {/* Title row */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
            My Orders
          </h1>
          <p style={{ fontSize: "12px", color: "#666", letterSpacing: "0.04em" }}>
            All payment orders from your suppliers
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px", maxWidth: "700px" }}>
          {[
            { label: "Total Orders", value: "5" },
            { label: "Total Paid",   value: "$8,226.25" },
            { label: "Pending",      value: "2" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "4px", padding: "16px 20px" }}>
              <div style={{ fontSize: "11px", color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 600, color: "#F5A623", fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr", backgroundColor: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "10px 20px" }}>
            {["Order #", "Supplier Name", "Amount", "Status", "Date"].map((col) => (
              <span key={col} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {mockOrders.map((order, i) => (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr",
                padding: "14px 20px",
                borderBottom: i < mockOrders.length - 1 ? "1px solid #111" : "none",
                backgroundColor: i % 2 === 0 ? "#000" : "#080808",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa" }}>{order.id}</span>
              <span style={{ fontSize: "13px", color: "#ddd" }}>{order.supplier}</span>
              <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5A623", fontWeight: 600 }}>{order.amount}</span>
              <span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: statusColor[order.status] ?? "#aaa",
                  backgroundColor: (statusColor[order.status] ?? "#aaa") + "18",
                  padding: "3px 8px",
                  borderRadius: "2px",
                  border: `1px solid ${statusColor[order.status] ?? "#aaa"}44`,
                }}>
                  {order.status}
                </span>
              </span>
              <span style={{ fontSize: "12px", color: "#555" }}>{order.date}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
