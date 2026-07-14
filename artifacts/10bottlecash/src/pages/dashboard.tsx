import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { getCurrentUser, getOrders, logout, type Order } from "@/lib/auth";

const STATUS_COLOR: Record<string, string> = {
  Completed:  "#22c55e",
  Processing: "#60a5fa",
};

export function Dashboard() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "supplier") { navigate("/signin"); return; }
    setUserName(user.name);
    setOrders(getOrders().filter(o => o.supplierEmail === user.email));
  }, []);

  function handleSignOut() { logout(); navigate("/signin"); }

  const totalPaid = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + parseFloat(o.amount.replace("$", "").replace(",", "")), 0);

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo className="w-12 h-12" />
          <span style={{ fontFamily: "'Space Mono',monospace", letterSpacing: "0.18em", fontSize: "13px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-10px" }}>
            10BOTTLECASH
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "12px", color: "#bbb" }}>{userName}</span>
          <button onClick={handleSignOut} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", background: "none", border: "none", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "36px 28px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
            My Orders
          </h1>
          <p style={{ fontSize: "12px", color: "#aaa" }}>
            Ваши платёжные заказы через 10BottleCash
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 200px))", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Всего заказов",  value: String(orders.length) },
            { label: "Выплачено",      value: "$" + totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 }) },
            { label: "В обработке",    value: String(orders.filter(o => o.status === "Processing").length) },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "14px 18px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#F5A623", fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {orders.length === 0 ? (
          <div style={{ color: "#888", fontSize: "13px", padding: "40px 0" }}>У вас пока нет заказов</div>
        ) : (
          <div style={{ border: "1px solid #151515", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 1fr", backgroundColor: "#0a0a0a", borderBottom: "1px solid #151515", padding: "10px 20px" }}>
              {["Order #", "Номер заказа", "Сумма", "Статус", "Дата"].map(c => (
                <span key={c} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>{c}</span>
              ))}
            </div>
            {orders.map((o, i) => (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 1fr", padding: "13px 20px", borderBottom: i < orders.length - 1 ? "1px solid #0f0f0f" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#060606" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888" }}>{o.id}</span>
                <span style={{ fontSize: "12px", color: "#ccc" }}>{o.orderNumber}</span>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5A623", fontWeight: 600 }}>{o.amount}</span>
                <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18", border: `1px solid ${STATUS_COLOR[o.status]}44`, padding: "2px 7px", borderRadius: "2px", display: "inline-block" }}>{o.status}</span>
                <span style={{ fontSize: "11px", color: "#aaa" }}>{o.date}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
