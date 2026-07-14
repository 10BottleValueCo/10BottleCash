import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useLang, STATUS_LABEL } from "@/lib/i18n";
import {
  getCurrentUser, logout, getUsers, getOrders, createSupplier,
  deleteSupplier, addOrder, type User, type Order,
} from "@/lib/auth";

const STATUS_COLOR: Record<string, string> = {
  Completed:  "#22c55e",
  Processing: "#60a5fa",
};

const inp: React.CSSProperties = {
  backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#fff",
  padding: "9px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%",
};
const lbl: React.CSSProperties = {
  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#aaa", marginBottom: "6px", display: "block",
};

export function Admin() {
  const [, navigate] = useLocation();
  const { lang, setLang, tr } = useLang();
  const [tab, setTab] = useState<"suppliers" | "orders">("suppliers");
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [orderForm, setOrderForm] = useState({ supplierEmail: "", amount: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = () => {
    setSuppliers(getUsers().filter(u => u.role === "supplier"));
    setOrders(getOrders());
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { navigate("/signin"); return; }
    refresh();
  }, []);

  const handleSignOut = () => { logout(); navigate("/signin"); };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password) { setError(tr("fillAllFields")); return; }
    if (!createSupplier(form.email, form.password, form.name)) { setError(tr("emailExists")); return; }
    setSuccess(`${tr("accountCreated")}: ${form.email} / ${form.password}`);
    setForm({ name: "", email: "", password: "" });
    refresh();
  };

  const handleDelete = (email: string) => {
    if (!confirm(`${tr("confirmDelete")} ${email}?`)) return;
    deleteSupplier(email); refresh();
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    const supplier = suppliers.find(s => s.email === orderForm.supplierEmail);
    if (!supplier) { setError(tr("fillAllFields")); return; }
    if (!orderForm.orderNumber || !orderForm.amount) { setError(tr("fillAllFields")); return; }
    const gross = parseFloat(orderForm.amount);
    addOrder({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      amount: "$" + gross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status: "Processing",
    });
    setSuccess(tr("orderAdded"));
    setOrderForm({ supplierEmail: "", orderNumber: "", amount: "" });
    refresh();
  };

  const handleStatusToggle = (orderId: string, current: Order["status"]) => {
    const next: Order["status"] = current === "Processing" ? "Completed" : "Processing";
    const all = getOrders().map(o => o.id === orderId ? { ...o, status: next } : o);
    const { saveOrders } = require("@/lib/auth");
    saveOrders(all);
    refresh();
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "8px 20px", border: "none", cursor: "pointer", borderRadius: "2px",
    backgroundColor: active ? "#F5A623" : "transparent",
    color: active ? "#000" : "#aaa",
  });

  const q = search.trim().toLowerCase();
  const filtered = orders.filter(o => {
    const matchSearch = !q || [o.id, o.supplierName, o.supplierEmail, o.orderNumber, o.amount, o.netAmount ?? "", o.status, o.date].some(v => v.toLowerCase().includes(q));
    const matchStatus  = !filterStatus  || o.status === filterStatus;
    const matchSupplier = !filterSupplier || o.supplierEmail === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Logo className="w-12 h-12" />
            <span style={{ fontFamily: "'Space Mono',monospace", letterSpacing: "0.18em", fontSize: "13px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-10px" }}>
              10BOTTLECASH
            </span>
          </div>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", backgroundColor: "#F5A62318", border: "1px solid #F5A62344", padding: "2px 8px", borderRadius: "2px" }}>
            {tr("admin")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
            <button onClick={() => setLang("en")} style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "en" ? "#F5A623" : "transparent", color: lang === "en" ? "#000" : "#666" }}>EN</button>
            <button onClick={() => setLang("zh")} style={{ padding: "5px 12px", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "zh" ? "#F5A623" : "transparent", color: lang === "zh" ? "#000" : "#666", fontFamily: "'Noto Sans SC', sans-serif" }}>中文</button>
          </div>
          <button onClick={handleSignOut} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
            {tr("signOut")}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px 28px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
          <button style={tabStyle(tab === "suppliers")} onClick={() => setTab("suppliers")}>{tr("suppliers")}</button>
          <button style={tabStyle(tab === "orders")} onClick={() => setTab("orders")}>{tr("orders")}</button>
        </div>

        {/* ── SUPPLIERS TAB ── */}
        {tab === "suppliers" && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "28px", alignItems: "start" }}>
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "20px" }}>{tr("newSupplier")}</div>
              <form onSubmit={handleAddSupplier} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div><label style={lbl}>{tr("companyName")}</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Valley Distributors" /></div>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="supplier@company.com" /></div>
                <div><label style={lbl}>{tr("passwordLabel")}</label><input style={inp} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
                {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
                {success && <div style={{ fontSize: "12px", color: "#22c55e", backgroundColor: "#22c55e12", border: "1px solid #22c55e33", borderRadius: "2px", padding: "8px 10px", wordBreak: "break-all" }}>✓ {success}</div>}
                <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000", padding: "11px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", marginTop: "4px" }}>
                  {tr("createAccount")}
                </button>
              </form>
            </div>

            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "16px" }}>
                {tr("allSuppliers")} ({suppliers.length})
              </div>
              {suppliers.length === 0 ? (
                <div style={{ color: "#888", fontSize: "13px" }}>{tr("noSuppliersYet")}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {suppliers.map(s => {
                    const cnt = orders.filter(o => o.supplierEmail === s.email).length;
                    return (
                      <div key={s.email} style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ddd", marginBottom: "3px" }}>{s.name}</div>
                          <div style={{ fontSize: "11px", color: "#999", fontFamily: "monospace" }}>{s.email}</div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{tr("passwordLabel")}: <span style={{ color: "#ccc" }}>{s.password}</span> · {cnt} {tr("orders").toLowerCase()}</div>
                        </div>
                        <button onClick={() => handleDelete(s.email)} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ef4444", background: "none", border: "1px solid #ef444433", borderRadius: "2px", padding: "4px 10px", cursor: "pointer" }}>
                          {tr("delete")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start" }}>
            {/* Add order form */}
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "22px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "18px" }}>{tr("addOrder")}</div>
              <form onSubmit={handleAddOrder} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                <div>
                  <label style={lbl}>{tr("suppliers")}</label>
                  <select style={{ ...inp, appearance: "none" }} value={orderForm.supplierEmail} onChange={e => setOrderForm(f => ({ ...f, supplierEmail: e.target.value }))}>
                    <option value="">{tr("selectSupplier")}</option>
                    {suppliers.map(s => <option key={s.email} value={s.email}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{tr("amount")} (gross $)</label>
                  <input style={inp} type="number" step="0.01" min="0.01" value={orderForm.amount} onChange={e => setOrderForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                  {orderForm.amount && parseFloat(orderForm.amount) > 0 && (
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>
                      Supplier receives: <span style={{ color: "#22c55e", fontFamily: "monospace", fontWeight: 600 }}>
                        ${(parseFloat(orderForm.amount) * 0.91).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span> (after 9% fee)
                    </div>
                  )}
                </div>
                {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
                {success && <div style={{ fontSize: "12px", color: "#22c55e" }}>✓ {success}</div>}
                <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000", padding: "11px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", marginTop: "4px" }}>
                  {tr("addOrder")}
                </button>
              </form>
            </div>

            {/* Orders list */}
            <div>
              {/* Filters */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr("searchPlaceholder")} style={{ ...inp, flex: "1", minWidth: "200px", fontSize: "12px" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: "140px", appearance: "none", fontSize: "12px" }}>
                  <option value="">{tr("allStatuses")}</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                </select>
                <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} style={{ ...inp, width: "160px", appearance: "none", fontSize: "12px" }}>
                  <option value="">{tr("allSuppliersFilt")}</option>
                  {suppliers.map(s => <option key={s.email} value={s.email}>{s.name}</option>)}
                </select>
                {(search || filterStatus || filterSupplier) && (
                  <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterSupplier(""); }} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F5A623", background: "none", border: "1px solid #F5A62344", borderRadius: "2px", padding: "7px 12px", cursor: "pointer" }}>
                    {tr("reset")}
                  </button>
                )}
              </div>

              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "12px" }}>
                {filtered.length === orders.length ? `${tr("allOrders")} (${orders.length})` : `${tr("found")}: ${filtered.length} ${tr("of")} ${orders.length}`}
              </div>

              {filtered.length === 0 ? (
                <div style={{ color: "#888", fontSize: "13px" }}>{orders.length === 0 ? tr("noOrdersYet") : tr("noOrdersFound")}</div>
              ) : (
                <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "hidden" }}>
                  {/* Table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "130px 100px 1.2fr 105px 105px 110px 170px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "9px 16px", gap: "8px" }}>
                    {["INV ID", "ORDER NO.", tr("suppliers"), "PAID (GROSS)", "NET (−9%)", tr("statusCol"), tr("dateCol")].map(c => (
                      <span key={c} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>{c}</span>
                    ))}
                  </div>
                  {filtered.map((o, i) => (
                    <div key={o.id} style={{ display: "grid", gridTemplateColumns: "130px 100px 1.2fr 105px 105px 110px 170px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #0f0f0f" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#060606", gap: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#F5A623", fontWeight: 700 }}>{o.id}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#aaa" }}>{o.orderNumber ?? "—"}</span>
                      <div>
                        <div style={{ fontSize: "12px", color: "#ddd" }}>{o.supplierName}</div>
                        <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace" }}>{o.supplierEmail}</div>
                      </div>
                      {/* Gross — what customer paid */}
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 700 }}>{o.amount}</span>
                      {/* Net — what supplier receives */}
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{o.netAmount ?? "—"}</span>
                      {/* Status badge */}
                      <span style={{
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: STATUS_COLOR[o.status],
                        backgroundColor: STATUS_COLOR[o.status] + "18",
                        border: `1px solid ${STATUS_COLOR[o.status]}44`,
                        padding: "2px 7px", borderRadius: "2px", display: "inline-block",
                      }}>
                        {STATUS_LABEL[o.status]?.[lang] ?? o.status}
                      </span>
                      <span style={{ fontSize: "11px", color: "#666" }}>{o.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
