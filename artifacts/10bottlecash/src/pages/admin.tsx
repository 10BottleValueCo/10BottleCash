import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useLang, STATUS_LABEL } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  logout, getUsers, getOrders, deleteSupplier, deleteUser, addOrder,
  getSupplierCode, regenerateSupplierCode, type User, type Order,
} from "@/lib/auth";

const STATUS_COLOR: Record<string, string> = {
  Completed:  "#22c55e",
  Processing: "#60a5fa",
  Unpaid:     "#ef4444",
};

const inp: React.CSSProperties = {
  backgroundColor: "#111", border: "1px solid #2a2a2a", color: "#fff",
  padding: "9px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%",
  colorScheme: "dark",
};
const lbl: React.CSSProperties = {
  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#aaa", marginBottom: "6px", display: "block",
};

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div style={{
      backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px",
      padding: "16px 20px", minWidth: "120px",
    }}>
      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'Space Mono',monospace", color: accent ?? "#fff", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export function Admin() {
  const [, navigate] = useLocation();
  const { lang, setLang, tr } = useLang();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<"users" | "orders">("users");
  const [userSubTab, setUserSubTab] = useState<"clients" | "suppliers">("clients");
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderForm, setOrderForm] = useState({ supplierEmail: "", orderNumber: "", amount: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const refresh = async () => {
    const users = await getUsers();
    setAllUsers(users.filter(u => u.role !== "admin"));
    setSuppliers(users.filter(u => u.role === "supplier"));
    setOrders(await getOrders());
    setSupplierCode(await getSupplierCode());
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") { navigate("/signin"); return; }
    refresh();
  }, [currentUser]);

  const handleSignOut = async () => { await logout(); navigate("/"); };

  const handleDelete = async (email: string) => {
    if (!confirm(`${tr("confirmDelete")} ${email}?`)) return;
    await deleteSupplier(email);
    await refresh();
  };

  const handleDeleteUser = async (email: string, role: string) => {
    if (!confirm(`${tr("deleteUserConfirm")} ${role} ${email}?`)) return;
    await deleteUser(email);
    await refresh();
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    const supplier = suppliers.find(s => s.email === orderForm.supplierEmail);
    if (!supplier) { setError(tr("fillAllFields")); return; }
    if (!orderForm.orderNumber || !orderForm.amount) { setError(tr("fillAllFields")); return; }
    const gross = parseFloat(orderForm.amount);
    await addOrder({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderNumber: orderForm.orderNumber,
      amount: "$" + gross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status: "Processing",
    });
    setSuccess(tr("orderAdded"));
    setOrderForm({ supplierEmail: "", orderNumber: "", amount: "" });
    await refresh();
  };

  const handleRegenerateCode = async () => {
    if (!confirm(tr("generateNewCodeConfirm"))) return;
    const newCode = await regenerateSupplierCode();
    setSupplierCode(newCode);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "8px 20px", border: "none", cursor: "pointer", borderRadius: "2px",
    backgroundColor: active ? "#F5A623" : "transparent",
    color: active ? "#000" : "#aaa",
  });

  const q = search.trim().toLowerCase();
  const filtered = orders.filter(o => {
    const matchSearch = !q || [o.id, o.supplierName, o.supplierEmail, o.orderNumber, o.amount, o.netAmount ?? "", o.status, o.date, o.clientEmail ?? ""].some(v => v.toLowerCase().includes(q));
    const matchStatus  = !filterStatus  || o.status === filterStatus;
    const matchSupplier = !filterSupplier || o.supplierEmail === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  const clients   = allUsers.filter(u => u.role === "client");
  const completed = orders.filter(o => o.status === "Completed").length;
  const processing = orders.filter(o => o.status === "Processing").length;
  const unpaid    = orders.filter(o => o.status === "Unpaid").length;

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderBottom: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Logo className="w-12 h-12" />
            <span style={{ fontFamily: "'Space Mono',monospace", letterSpacing: "0.18em", fontSize: "13px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-10px" }}>
              10BOTTLECASH
            </span>
          </Link>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", backgroundColor: "#F5A62318", border: "1px solid #F5A62344", padding: "2px 8px", borderRadius: "2px" }}>
            {tr("admin")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
            <button onClick={() => setLang("en")} style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "en" ? "#F5A623" : "transparent", color: lang === "en" ? "#000" : "#666" }}>EN</button>
            <button onClick={() => setLang("zh")} style={{ padding: "5px 12px", fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "zh" ? "#F5A623" : "transparent", color: lang === "zh" ? "#000" : "#fff", fontFamily: "'Noto Sans SC', sans-serif" }}>中文</button>
          </div>
          <button onClick={handleSignOut} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
            {tr("signOut")}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "28px 28px" }}>

        {/* ── Stats overview ── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
          <StatCard label={tr("clients")}     value={clients.length}   accent="#60a5fa" />
          <StatCard label={tr("suppliers")}   value={suppliers.length} accent="#F5A623" />
          <div style={{ width: "1px", backgroundColor: "#1a1a1a", alignSelf: "stretch", margin: "0 4px" }} />
          <StatCard label={tr("allOrders")}   value={orders.length} />
          <StatCard label="Completed"  value={completed}   accent="#22c55e" />
          <StatCard label="Processing" value={processing}  accent="#60a5fa" />
          <StatCard label="Unpaid"     value={unpaid}      accent="#ef4444" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
          <button style={tabStyle(tab === "users")} onClick={() => setTab("users")}>{tr("usersTab")}</button>
          <button style={tabStyle(tab === "orders")} onClick={() => setTab("orders")}>{tr("orders")}</button>
        </div>

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "28px", alignItems: "start" }}>

            {/* Supplier invite code card */}
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", marginBottom: "16px" }}>
                {tr("supplierInviteCode")}
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: "22px", fontWeight: 700, letterSpacing: "0.18em",
                color: "#F5A623", backgroundColor: "#F5A62310", border: "1px solid #F5A62330",
                padding: "14px 20px", borderRadius: "2px", textAlign: "center", marginBottom: "12px",
                userSelect: "all",
              }}>
                {supplierCode}
              </div>
              <p style={{ fontSize: "11px", color: "#666", marginBottom: "14px", lineHeight: 1.5 }}>
                {tr("inviteCodeDescAdmin")}
              </p>
              <button
                onClick={handleRegenerateCode}
                style={{ width: "100%", padding: "9px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", backgroundColor: "transparent", color: "#F5A623", border: "1px solid #F5A62344", borderRadius: "2px", cursor: "pointer" }}
              >
                {tr("regenerateCode")}
              </button>
            </div>

            {/* Clients / Suppliers sub-tabs */}
            <div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "18px" }}>
                {(["clients", "suppliers"] as const).map(st => {
                  const count = st === "clients" ? clients.length : suppliers.length;
                  const active = userSubTab === st;
                  return (
                    <button key={st} onClick={() => setUserSubTab(st)} style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "6px 16px", border: "1px solid", borderRadius: "2px", cursor: "pointer",
                      backgroundColor: active ? "#F5A623" : "transparent",
                      color: active ? "#000" : "#aaa",
                      borderColor: active ? "#F5A623" : "#2a2a2a",
                    }}>
                      {st} ({count})
                    </button>
                  );
                })}
              </div>

              {(() => {
                const list = userSubTab === "clients" ? clients : suppliers;
                if (list.length === 0) return (
                  <div style={{ color: "#888", fontSize: "13px" }}>
                    {userSubTab === "clients" ? tr("noClientsYet") : tr("noSuppliersRegistered")}
                  </div>
                );

                // For clients: show name, email, their order counts
                // For suppliers: show name, email, completed/processing/unpaid order counts
                const enriched = list.map(u => {
                  const userOrders = orders.filter(o =>
                    userSubTab === "suppliers"
                      ? o.supplierEmail === u.email
                      : o.clientEmail === u.email
                  );
                  return { ...u, orders: userOrders };
                });

                const isSupplier = userSubTab === "suppliers";

                return (
                  <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isSupplier ? "22px 1fr 1.4fr 70px 70px 70px 80px" : "22px 1fr 1.4fr 80px 80px",
                      backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a",
                      padding: "9px 16px", gap: "8px",
                    }}>
                      {(isSupplier
                        ? ["", tr("nameCol"), tr("emailCol"), "DONE", "PENDING", "UNPAID", ""]
                        : ["", tr("nameCol"), tr("emailCol"), "ORDERS", ""]
                      ).map((c, i) => (
                        <span key={i} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>{c}</span>
                      ))}
                    </div>

                    {enriched.map((u, i) => {
                      const done      = u.orders.filter(o => o.status === "Completed").length;
                      const pending   = u.orders.filter(o => o.status === "Processing").length;
                      const unpaidCount = u.orders.filter(o => o.status === "Unpaid").length;
                      const isExpanded = expandedUser === u.email;
                      const isLast     = i === enriched.length - 1;
                      return (
                        <div key={u.email}>
                          {/* Row */}
                          <div
                            onClick={() => setExpandedUser(isExpanded ? null : u.email)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: isSupplier ? "22px 1fr 1.4fr 70px 70px 70px 80px" : "22px 1fr 1.4fr 80px 80px",
                              padding: "12px 16px",
                              borderBottom: (!isExpanded && !isLast) ? "1px solid #0f0f0f" : "none",
                              alignItems: "center",
                              backgroundColor: isExpanded ? "#0d0d0d" : i % 2 === 0 ? "#000" : "#060606",
                              gap: "8px",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            {/* Chevron */}
                            <span style={{ fontSize: "9px", color: "#555", transition: "transform 0.15s", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                            <div style={{ fontSize: "13px", color: "#ddd", fontWeight: 600 }}>{u.name}</div>
                            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#aaa" }}>{u.email}</span>
                            {isSupplier ? (
                              <>
                                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#22c55e", fontWeight: 700 }}>{done}</span>
                                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#60a5fa", fontWeight: 700 }}>{pending}</span>
                                <span style={{ fontSize: "12px", fontFamily: "monospace", color: unpaidCount > 0 ? "#ef4444" : "#555", fontWeight: 700 }}>{unpaidCount}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#aaa" }}>{u.orders.length}</span>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); u.role === "supplier" ? handleDelete(u.email) : handleDeleteUser(u.email, u.role); }}
                              style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ef4444", background: "none", border: "1px solid #ef444433", borderRadius: "2px", padding: "3px 8px", cursor: "pointer" }}
                            >
                              {tr("delete")}
                            </button>
                          </div>

                          {/* Expanded orders panel */}
                          {isExpanded && (
                            <div style={{ backgroundColor: "#080808", borderBottom: !isLast ? "1px solid #0f0f0f" : "none", borderTop: "1px solid #1a1a1a", padding: "14px 20px 14px 40px" }}>
                              {u.orders.length === 0 ? (
                                <div style={{ fontSize: "12px", color: "#555", fontStyle: "italic" }}>No orders yet</div>
                              ) : (
                                <div style={{ border: "1px solid #1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
                                  {/* Mini header */}
                                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px 100px 100px 150px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "7px 14px", gap: "8px" }}>
                                    {["ORDER #", isSupplier ? "CLIENT" : "SUPPLIER", "GROSS", "NET", "STATUS", "DATE"].map((c, ci) => (
                                      <span key={ci} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555" }}>{c}</span>
                                    ))}
                                  </div>
                                  {u.orders.map((o, oi) => (
                                    <div key={o.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px 100px 100px 150px", padding: "10px 14px", borderBottom: oi < u.orders.length - 1 ? "1px solid #111" : "none", alignItems: "center", gap: "8px" }}>
                                      <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#F5A623", fontWeight: 700 }}>{o.orderNumber || o.id}</div>
                                        {o.invoiceId && <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#444", marginTop: "2px" }}>{o.invoiceId}</div>}
                                      </div>
                                      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#888" }}>
                                        {isSupplier ? (o.clientEmail ?? "—") : o.supplierName}
                                      </span>
                                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 700 }}>{o.amount}</span>
                                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{o.netAmount ?? "—"}</span>
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start" }}>
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
                  <label style={lbl}>{tr("orderNumberLabel")}</label>
                  <input style={inp} value={orderForm.orderNumber} onChange={e => setOrderForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="ORD-1234" />
                </div>
                <div>
                  <label style={lbl}>{tr("amount")} (gross $)</label>
                  <input style={inp} type="number" step="0.01" min="0.01" value={orderForm.amount} onChange={e => setOrderForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                  {orderForm.amount && parseFloat(orderForm.amount) > 0 && (
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>
                      {tr("supplierReceives")} <span style={{ color: "#22c55e", fontFamily: "monospace", fontWeight: 600 }}>
                        ${(parseFloat(orderForm.amount) * 0.91).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span> {tr("afterFee")}
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

            <div>
              {/* Filters */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={tr("searchPlaceholder")}
                  style={{ ...inp, flex: "1", minWidth: "200px", fontSize: "12px" }}
                />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: "150px", appearance: "none", fontSize: "12px" }}>
                  <option value="">{tr("allStatuses")}</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Processing">🔵 Processing</option>
                  <option value="Unpaid">🔴 Unpaid</option>
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
                {filtered.length === orders.length
                  ? `${tr("allOrders")} (${orders.length})`
                  : `${tr("found")}: ${filtered.length} ${tr("of")} ${orders.length}`}
              </div>

              {filtered.length === 0 ? (
                <div style={{ color: "#888", fontSize: "13px" }}>{orders.length === 0 ? tr("noOrdersYet") : tr("noOrdersFound")}</div>
              ) : (
                <div style={{ border: "1px solid #1a1a1a", borderRadius: "4px", overflow: "auto" }}>
                  <div style={{ minWidth: "860px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 100px 100px 100px 150px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "9px 16px", gap: "8px" }}>
                      {["ORDER #", tr("suppliers"), "CLIENT", "GROSS", "NET (−9%)", tr("statusCol"), tr("dateCol")].map((c, i) => (
                        <span key={i} style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>{c}</span>
                      ))}
                    </div>
                    {filtered.map((o, i) => (
                      <div key={o.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 100px 100px 100px 150px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #111" : "none", alignItems: "center", backgroundColor: i % 2 === 0 ? "#000" : "#070707", gap: "8px" }}>
                        <div>
                          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#F5A623", fontWeight: 700 }}>{o.orderNumber || o.id}</div>
                          {o.invoiceId && <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#555", marginTop: "2px" }}>{o.invoiceId}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", color: "#fff" }}>{o.supplierName}</div>
                          <div style={{ fontSize: "10px", color: "#777", fontFamily: "monospace" }}>{o.supplierEmail}</div>
                        </div>
                        <div>
                          {o.clientEmail
                            ? <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#aaa" }}>{o.clientEmail}</span>
                            : <span style={{ fontSize: "10px", color: "#444" }}>—</span>
                          }
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#F5A623", fontWeight: 700 }}>{o.amount}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{o.netAmount ?? "—"}</span>
                        <span style={{
                          fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                          color: STATUS_COLOR[o.status],
                          backgroundColor: STATUS_COLOR[o.status] + "18",
                          border: `1px solid ${STATUS_COLOR[o.status]}44`,
                          padding: "2px 7px", borderRadius: "2px", display: "inline-block",
                        }}>
                          {STATUS_LABEL[o.status]?.[lang] ?? o.status}
                        </span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>{o.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
