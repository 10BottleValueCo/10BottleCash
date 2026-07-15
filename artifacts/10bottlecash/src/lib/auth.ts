import { supabase } from "./supabase";

export type Role = "admin" | "supplier" | "client";

export interface User {
  id?: string;
  email: string;
  name: string;
  role: Role;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceId?: string;
  createdAt?: number;
  supplierEmail: string;
  supplierName: string;
  clientEmail?: string;
  amount: string;
  netAmount: string;
  status: "Completed" | "Processing" | "Unpaid";
  date: string;
}

const COMMISSION = 0.09;

export function calcNet(grossStr: string): string {
  const gross = parseFloat(grossStr.replace(/[$,]/g, ""));
  return (
    "$" +
    (gross * (1 - COMMISSION)).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// ── Module-level user cache (set by AuthProvider) ──────────────
let _currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return _currentUser;
}

export function _setCurrentUser(user: User | null) {
  _currentUser = user;
}

// ── Helpers ────────────────────────────────────────────────────
function genInvId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "INV-" + s;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    invoiceId: o.invoice_id ?? undefined,
    createdAt: o.created_at_ms ?? undefined,
    supplierEmail: o.supplier_email,
    supplierName: o.supplier_name,
    clientEmail: o.client_email ?? undefined,
    amount: o.amount,
    netAmount: calcNet(o.amount),
    status: o.status as Order["status"],
    date: o.date_label,
  };
}

// ── Auth ────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", data.user.id)
    .single();

  if (!profile) return null;
  const user: User = { id: profile.id, email: profile.email, name: profile.name, role: profile.role as Role };
  _setCurrentUser(user);
  return user;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  _setCurrentUser(null);
}

async function ensureSession(email: string, password: string): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return true;
  // No session after signUp → email confirmation may be on; try signing in
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export async function registerClient(
  email: string,
  password: string,
  name: string
): Promise<"ok" | "emailTaken" | "error"> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || error.status === 422) return "emailTaken";
    return "error";
  }
  if (!data.user) return "error";

  await ensureSession(email, password);

  const { error: pe } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, email, name, role: "client" });

  return pe ? "error" : "ok";
}

export async function registerSupplier(
  email: string,
  password: string,
  name: string,
  code: string
): Promise<"ok" | "badCode" | "emailTaken" | "error"> {
  const storedCode = await getSupplierCode();
  if (code.trim().toUpperCase() !== storedCode.toUpperCase()) return "badCode";

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || error.status === 422) return "emailTaken";
    return "error";
  }
  if (!data.user) return "error";

  await ensureSession(email, password);

  const { error: pe } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, email, name, role: "supplier" });

  if (pe) { console.error("Profile insert error:", pe); return "error"; }

  const user: User = { id: data.user.id, email, name, role: "supplier" };
  _setCurrentUser(user);
  return "ok";
}

// ── Users (admin ops) ──────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .neq("role", "admin")
    .order("created_at", { ascending: false });
  return (data ?? []).map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role as Role }));
}

export async function deleteUser(email: string): Promise<void> {
  await supabase.from("profiles").delete().eq("email", email);
}

export async function deleteSupplier(email: string): Promise<void> {
  await supabase.from("profiles").delete().eq("email", email);
  await supabase.from("orders").delete().eq("supplier_email", email);
}

/** Find supplier by name (case-insensitive). Works for anonymous users. */
export async function findSupplierByName(name: string): Promise<User | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("role", "supplier")
    .ilike("name", name.trim());

  if (!data || data.length === 0) return null;
  const u = data[0];
  return { id: u.id, email: u.email, name: u.name, role: "supplier" };
}

// ── Orders ──────────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("inserted_at", { ascending: false });
  return (data ?? []).map(mapOrder);
}

export async function addOrder(order: Omit<Order, "id" | "date" | "netAmount">): Promise<Order> {
  const gross = order.amount.startsWith("$") ? order.amount : "$" + order.amount;
  const id = genInvId();
  const dateLabel =
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
    " · " +
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  await supabase.from("orders").insert({
    id,
    order_number: order.orderNumber,
    invoice_id: order.invoiceId ?? null,
    created_at_ms: order.createdAt ?? Date.now(),
    supplier_email: order.supplierEmail,
    supplier_name: order.supplierName,
    client_email: order.clientEmail ?? null,
    amount: gross,
    net_amount: calcNet(gross),
    status: order.status,
    date_label: dateLabel,
  });

  return {
    id,
    orderNumber: order.orderNumber,
    invoiceId: order.invoiceId,
    createdAt: order.createdAt ?? Date.now(),
    supplierEmail: order.supplierEmail,
    supplierName: order.supplierName,
    clientEmail: order.clientEmail,
    amount: gross,
    netAmount: calcNet(gross),
    status: order.status,
    date: dateLabel,
  };
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  await supabase.from("orders").update({ status }).eq("id", id);
}

export async function updateOrderInvoiceId(orderId: string, invoiceId: string): Promise<void> {
  await supabase.from("orders").update({ invoice_id: invoiceId }).eq("id", orderId);
}

// ── Supplier invite code ────────────────────────────────────────
export async function getSupplierCode(): Promise<string> {
  const { data } = await supabase
    .from("supplier_codes")
    .select("code")
    .eq("id", 1)
    .single();
  return data?.code ?? "NOTFOUND";
}

export async function regenerateSupplierCode(): Promise<string> {
  const code = generateCode();
  await supabase.from("supplier_codes").update({ code }).eq("id", 1);
  return code;
}
