import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import {
  getCurrentUser, logout, getUsers, getOrders, createSupplier,
  deleteSupplier, addOrder, type User, type Order,
} from "@/lib/auth";

const STATUS_COLOR: Record<string, string> = {
  Completed:  "#22c55e",
  Pending:    "#F5A623",
  Processing: "#60a5fa",
};

const input: React.CSSProperties = {
  backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#fff",
  padding: "9px 12px", fontSize: "13px", borderRadius: "2px",
  outline: "none", width: "100%",
};

const label: React.CSSProperties = {
  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#666", marginBottom: "6px", display: "block",
};

export function Admin() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"suppliers" | "orders">("suppliers");
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [orderForm, setOrderForm] = useState({ supplierEmail: "", orderNumber: "", amount: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = () => {
    setSuppliers(getUsers().filter((u) => u.role === "supplier"));
    setOrders(getOrders());
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { navigate("/signin"); return; }
    refresh();
  }, []);

  function handleSignOut() { logout(); navigate("/signin"); }

  function handleAddSupplier(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password) { setError("Заполните все поля"); return; }
    const ok = createSupplier(form.email, form.password, form.name);
    if (!ok) { setError("Такой email уже существует"); return; }
    setSuccess(`Аккаунт создан: ${form.email} / ${form.password}`);
    setForm({ name: "", email: "", password: "" });
    refresh();
  }

  function handleDelete(email: string) {
    if (!confirm(`Удалить поставщика ${email}?`)) return;
    deleteSupplier(email);
    refresh();
  }

  function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const supplier = suppliers.find(s => s.email === orderForm.supplierEmail);
    if (!supplier) { setError("Выберите поставщика"); return; }
    if (!orderForm.orderNumber || !orderForm.amount) { setError("Заполните все поля"); return; }
    addOrder({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderNumber: orderForm.orderNumber,
      amount: "$" + parseFloat(orderForm.amount).toFixed(2),
      status: "Pending",
    });
    setSuccess("Заказ добавлен");
    setOrderForm({ supplierEmail: "", orderNumber: "", amount: "" });
    refresh();
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "8px 20px", border: "none", cursor: "pointer", borderRadius: "2px",
    backgroundColor: active ? "#F5A623" : "transparent",
    color: active ? "#000" : "#aaa",
  });

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo className="w-12 h-12" />
          <span style={{ fontFamily: "'Space Mono',monospace", letterSpacing: "0.18em", fontSize: "13px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-10px" }}>
            10BOTTLECASH
          </span>
          <span style={{ marginLeft: "16px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", backgroundColor: "#F5A62318", border: "1px solid #F5A62344", padding: "2px 8px", borderRadius: "2px" }}>
            ADMIN
          </span>
        </div>
        <button onClick={handleSignOut} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
          Sign Out
        </button>
      </header>

      <main style={{ flex: 1, padding: "32px 28px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
          <button style={tabStyle(tab === "suppliers")} onClick={() => setTab("suppliers")}>Поставщики</button>
          <button style={tabStyle(tab === "orders")} onClick={() => setTab("orders")}>Заказы</button>
        </div>

        {/* ── SUPPLIERS TAB ── */}
        {tab === "suppliers" && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "28px", alignItems: "start" }}>

            {/* Create supplier form */}
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px" }}>
                Новый поставщик
              </div>
              <form onSubmit={handleAddSupplier} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={label}>Название компании</label>
                  <input style={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Valley Distributors" />
                </div>
                <div>
                  <label style={label}>Email</label>
                  <input style={input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="supplier@company.com" />
                </div>
                <div>
                  <label style={label}>Пароль</label>
                  <input style={input} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Придумайте пароль" />
                </div>
                {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
                {success && (
                  <div style={{ fontSize: "12px", color: "#22c55e", backgroundColor: "#22c55e12", border: "1px solid #22c55e33", borderRadius: "2px", padding: "8px 10px", wordBreak: "break-all" }}>
                    ✓ {success}
                  </div>
                )}
                <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000", padding: "11px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", marginTop: "4px" }}>
                  Создать аккаунт
                </button>
              </form>
            </div>

            {/* Suppliers list */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "16px" }}>
                Все поставщики ({suppliers.length})
              </div>
              {suppliers.length === 0 ? (
                <div style={{ color: "#888", fontSize: "13px" }}>Пока нет поставщиков</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {suppliers.map((s) => {
                    const supOrders = orders.filter(o => o.supplierEmail === s.email);
                    return (
                      <div key={s.email} style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ddd", marginBottom: "3px" }}>{s.name}</div>
                          <div style={{ fontSize: "11px", color: "#999", fontFamily: "monospace" }}>{s.email}</div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Пароль: <span style={{ color: "#ccc" }}>{s.password}</span> · {supOrders.length} заказов</div>
                        </div>
                        <button onClick={() => handleDelete(s.email)} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ef4444", background: "none", border: "1px solid #ef444433", borderRadius: "2px", padding: "4px 10px", cursor: "pointer" }}>
                          Удалить
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
        {tab === "orders" && (() => {
          const q = search.trim().toLowerCase();
          const filtered = orders.filter(o => {
            const matchSearch = !q || [o.id, o.supplierName, o.supplierEmail, o.orderNumber, o.amount, o.status, o.date]
              .some(v => v.toLowerCase().includes(q));
            const matchStatus = !filterStatus || o.status === filterStatus;
            const matchSupplier = !filterSupplier || o.supplierEmail === filterSupplier;
            return matchSearch && matchStatus && matchSupplier;
          });

          return (
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start" }}>

              {/* Add order form */}
              <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "22px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "18px" }}>
                  Добавить заказ
                </div>
                <form onSubmit={handleAddOrder} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                  <div>
                    <label style={label}>Поставщик</label>
                    <select style={{ ...input, appearance: "none" }} value={orderForm.supplierEmail} onChange={e => setOrderForm(f => ({ ...f, supplierEmail: e.target.value }))}>
                      <option value="">Выберите поставщика</option>
                      {suppliers.map(s => <option key={s.email} value={s.email}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Номер заказа</label>
                    <input style={input} value={orderForm.orderNumber} onChange={e => setOrderForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="ORD-001" />
                  </div>
                  <div>
                    <label style={label}>Сумма ($)</label>
                    <input style={input} type="number" step="0.01" value={orderForm.amount} onChange={e => setOrderForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                  </div>
                  {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
                  {success && <div style={{ fontSize: "12px", color: "#22c55e" }}>✓ {success}</div>}
                  <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000", padding: "11px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", marginTop: "4px" }}>
                    Добавить заказ
                  </button>
                </form>
              </div>

              {/* Orders list with search */}
              <div>
                {/* Search & filter bar */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="🔍  Поиск по ID, поставщику, номеру заказа, сумме..."
                    style={{ ...input, flex: "1", minWidth: "220px", fontSize: "12px", color: "#ddd" }}
                  />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ ...input, width: "130px", appearance: "none", fontSize: "12px", color: "#ddd" }}
                  >
                    <option value="">Все статусы</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <select
                    value={filterSupplier}
                    onChange={e => setFilterSupplier(e.target.value)}
                    style={{ ...input, width: "160px", appearance: "none", fontSize: "12px", color: "#ddd" }}
                  >
                    <option value="">Все поставщики</option>
                    {suppliers.map(s => <option key={s.email} value={s.email}>{s.name}</option>)}
                  </select>
                  {(search || filterStatus || filterSupplier) && (
                    <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterSupplier(""); }}
                      style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F5A623", background: "none", border: "1px solid #F5A62344", borderRadius: "2px", padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Сбросить
                    </button>
                  )}
                </div>

                {/* Counter */}
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "12px" }}>
                  {filtered.length === orders.length
                    ? `Все заказы (${orders.length})`
                    : `Найдено: ${filtered.length} из ${orders.length}`}
                </div>

                {filtered.length === 0 ? (
                  <div style={{ color: "#888", fontSize: "13px", padding: "20px 0" }}>
                    {orders.length === 0 ? "Нет заказов" : "Ничего не найдено"}
                  </div>
                ) : (
                  <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "100px 120px 1.6fr 100px 110px 90px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "9px 16px" }}>
                      {["ID", "Order #", "Поставщик", "Сумма", "Статус", "Дата"].map(c => (
                        <span key={c} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>{c}</span>
                      ))}
                    </div>
                    {/* Rows */}
                    {filtered.map((o, i) => (
                      <div key={o.id} style={{ display: "grid", gridTemplateColumns: "100px 120px 1.6fr 100px 110px 90px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #0f0f0f" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#060606" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#F5A623", fontWeight: 600 }}>{o.id}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#bbb" }}>{o.orderNumber}</span>
                        <div>
                          <div style={{ fontSize: "12px", color: "#ddd" }}>{o.supplierName}</div>
                          <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace" }}>{o.supplierEmail}</div>
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 600 }}>{o.amount}</span>
                        <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18", border: `1px solid ${STATUS_COLOR[o.status]}44`, padding: "2px 7px", borderRadius: "2px", display: "inline-block" }}>{o.status}</span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>{o.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
