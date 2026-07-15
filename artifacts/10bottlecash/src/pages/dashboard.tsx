import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { getOrders, logout, updateOrderStatus, type Order, type Role } from "@/lib/auth";
import { useLang, STATUS_LABEL } from "@/lib/i18n";

const STATUS_COLOR: Record<string, string> = {
  Completed:  "#22c55e",
  Processing: "#60a5fa",
  Unpaid:     "#ef4444",
};

const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function CountdownBadge({ orderId, createdAt, onExpire }: { orderId: string; createdAt: number; onExpire: (id: string) => void }) {
  const getRemaining = () => Math.max(0, PAYMENT_WINDOW_MS - (Date.now() - createdAt));
  const [remaining, setRemaining] = useState(getRemaining);
  const fired = useRef(false);

  useEffect(() => {
    if (remaining === 0 && !fired.current) {
      fired.current = true;
      onExpire(orderId);
      return;
    }
    if (remaining === 0) return;
    const id = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r === 0 && !fired.current) {
        fired.current = true;
        clearInterval(id);
        onExpire(orderId);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const label = remaining === 0 ? "Unpaid" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const color = remaining === 0 ? "#ef4444" : remaining < 60000 ? "#f97316" : "#60a5fa";

  return (
    <span style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      color, backgroundColor: color + "18", border: `1px solid ${color}44`,
      padding: "2px 10px", borderRadius: "3px", display: "inline-block", width: "fit-content",
      fontFamily: "monospace",
    }}>
      {remaining > 0 ? `⏱ ${label}` : label}
    </span>
  );
}

export function Dashboard() {
  const [, navigate] = useLocation();
  const { lang, setLang, tr } = useLang();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<Role>("supplier");

  useEffect(() => {
    if (!user || user.role === "admin") { navigate("/signin"); return; }
    setRole(user.role);
    loadOrders(user);
  }, [user]);

  const loadOrders = async (u: typeof user) => {
    if (!u) return;
    const all = await getOrders();
    const myOrders = u.role === "supplier"
      ? all.filter(o => o.supplierEmail === u.email)
      : all.filter(o => o.clientEmail === u.email);
    setOrders(myOrders);

    // Poll status for Processing orders with invoiceId
    const toCheck = myOrders.filter(o => o.status === "Processing" && o.invoiceId);
    if (toCheck.length === 0) return;

    const results = await Promise.all(
      toCheck.map(o =>
        fetch(`/api/payments/status/${o.invoiceId}`)
          .then(r => r.json())
          .then((data: { status: string }) => ({ orderId: o.id, apiStatus: data.status }))
          .catch(() => null)
      )
    );

    let changed = false;
    for (const r of results) {
      if (!r) continue;
      if (r.apiStatus === "Settled" || r.apiStatus === "Complete") {
        await updateOrderStatus(r.orderId, "Completed"); changed = true;
      } else if (r.apiStatus === "Expired" || r.apiStatus === "Invalid") {
        await updateOrderStatus(r.orderId, "Unpaid"); changed = true;
      }
    }
    if (changed && u) loadOrders(u);
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  const totalGross = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + parseFloat(o.amount.replace(/[$,]/g, "")), 0);

  const totalNet = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + parseFloat((o.netAmount ?? o.amount).replace(/[$,]/g, "")), 0);

  const isZh = lang === "zh";
  const fontFamily = isZh ? "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" : "inherit";

  const labelStyle = isZh
    ? { fontSize: "13px", fontWeight: 700, color: "#aaa", marginBottom: "8px" }
    : { fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "8px" };
  const thStyle = isZh
    ? { fontSize: "13px", fontWeight: 700, color: "#bbb" }
    : { fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#666" };
  const h1Style = isZh
    ? { fontSize: "20px", fontWeight: 700, marginBottom: "6px" }
    : { fontSize: "17px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "4px" };
  const subStyle = isZh
    ? { fontSize: "14px", color: "#aaa" }
    : { fontSize: "12px", color: "#aaa" };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column", fontFamily }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/")}>
          <Logo className="w-12 h-12" />
          <span style={{ fontFamily: "'Space Mono',monospace", letterSpacing: "0.18em", fontSize: "13px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-10px" }}>
            10BOTTLECASH
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
            <button onClick={() => setLang("en")} style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", border: "none", cursor: "pointer", backgroundColor: lang === "en" ? "#F5A623" : "transparent", color: lang === "en" ? "#000" : "#666", transition: "all 0.15s" }}>EN</button>
            <button onClick={() => setLang("zh")} style={{ padding: "5px 14px", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "zh" ? "#F5A623" : "transparent", color: lang === "zh" ? "#000" : "#888", transition: "all 0.15s", fontFamily: "'Noto Sans SC', sans-serif" }}>中文</button>
          </div>

          <span style={{ fontSize: isZh ? "14px" : "12px", color: "#bbb" }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ fontSize: isZh ? "14px" : "11px", fontWeight: 600, letterSpacing: isZh ? 0 : "0.1em", textTransform: isZh ? "none" : "uppercase", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
            {tr("signOut")}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "36px 28px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={h1Style}>{tr("myOrders")}</h1>
          <p style={subStyle}>{tr("myOrdersSub")}</p>
        </div>

        {/* Pay with Cash App button — clients only */}
        {role === "client" && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "8px 18px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", backgroundColor: "#F5A623", color: "#000", border: "none", borderRadius: "3px", cursor: "pointer" }}
            >
              {isZh ? "通过 Cash App 付款" : "Pay with Cash App"}
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${role === "supplier" ? 4 : 3}, minmax(0, 220px))`, gap: "14px", marginBottom: "28px" }}>
          {[
            { label: tr("totalOrders"),  value: String(orders.length), color: "#fff" },
            { label: tr("inProgress"),   value: String(orders.filter(o => o.status === "Processing").length), color: "#60a5fa" },
            { label: isZh ? "已付款" : "Amount Paid", value: "$" + totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 }), color: "#F5A623" },
            ...(role === "supplier" ? [{ label: isZh ? "到账金额 (−9%)" : "You Receive (−9%)", value: "$" + totalNet.toLocaleString("en-US", { minimumFractionDigits: 2 }), color: "#22c55e" }] : []),
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "14px 18px" }}>
              <div style={labelStyle}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {orders.length === 0 ? (
          <div style={{ color: "#888", fontSize: isZh ? "15px" : "13px", padding: "40px 0" }}>{tr("noOrders")}</div>
        ) : (
          <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "hidden" }}>
            {role === "supplier" ? (
              <div style={{ display: "grid", gridTemplateColumns: "180px 140px 140px 140px 180px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: isZh ? "12px 20px" : "10px 20px", gap: "12px" }}>
                {[tr("orderId"), tr("amountCol"), isZh ? "到账金额" : "You Receive", tr("statusCol"), tr("dateCol")].map(c => (
                  <span key={c} style={thStyle}>{c}</span>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px 140px 180px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "10px 20px", gap: "12px" }}>
                {[tr("orderId"), "Supplier", tr("amountCol"), tr("statusCol"), tr("dateCol")].map(c => (
                  <span key={c} style={thStyle}>{c}</span>
                ))}
              </div>
            )}

            {orders.map((o, i) => role === "supplier" ? (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "180px 140px 140px 140px 180px", padding: isZh ? "16px 20px" : "14px 20px", borderBottom: i < orders.length - 1 ? "1px solid #0f0f0f" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#060606", gap: "12px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 700 }}>{o.id}</span>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5A623", fontWeight: 700 }}>{o.amount}</span>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#22c55e", fontWeight: 700 }}>{o.netAmount ?? "—"}</span>
                {o.status === "Processing" && o.createdAt ? (
                  <CountdownBadge
                    orderId={o.id}
                    createdAt={o.createdAt}
                    onExpire={(id) => {
                      updateOrderStatus(id, "Unpaid").catch(console.error);
                      setOrders(prev => prev.map(x => x.id === id ? { ...x, status: "Unpaid" } : x));
                    }}
                  />
                ) : (
                  <span style={{ fontSize: isZh ? "13px" : "9px", fontWeight: 700, letterSpacing: isZh ? 0 : "0.08em", textTransform: isZh ? "none" : "uppercase", color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18", border: `1px solid ${STATUS_COLOR[o.status]}44`, padding: isZh ? "3px 10px" : "2px 10px", borderRadius: "3px", display: "inline-block", width: "fit-content" }}>
                    {STATUS_LABEL[o.status]?.[lang] ?? o.status}
                  </span>
                )}
                <span style={{ fontSize: isZh ? "13px" : "11px", color: "#aaa" }}>{o.date}</span>
              </div>
            ) : (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px 140px 180px", padding: "14px 20px", borderBottom: i < orders.length - 1 ? "1px solid #0f0f0f" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#060606", gap: "12px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 700 }}>{o.id}</span>
                <div>
                  <div style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>{o.supplierName}</div>
                  <div style={{ fontSize: "10px", color: "#888", fontFamily: "monospace" }}>{o.supplierEmail}</div>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5A623", fontWeight: 700 }}>{o.amount}</span>
                {o.status === "Processing" && o.createdAt ? (
                  <CountdownBadge
                    orderId={o.id}
                    createdAt={o.createdAt}
                    onExpire={(id) => {
                      updateOrderStatus(id, "Unpaid").catch(console.error);
                      setOrders(prev => prev.map(x => x.id === id ? { ...x, status: "Unpaid" } : x));
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18", border: `1px solid ${STATUS_COLOR[o.status]}44`, padding: "2px 10px", borderRadius: "3px", display: "inline-block", width: "fit-content" }}>
                    {STATUS_LABEL[o.status]?.[lang] ?? o.status}
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "#aaa" }}>{o.date}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
