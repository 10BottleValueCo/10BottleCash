export type Role = "admin" | "supplier" | "client";

export interface User {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface Order {
  id: string;
  orderNumber: string;  // reference entered by the customer
  invoiceId?: string;   // CatalystPay invoice ID for status polling
  createdAt?: number;   // Unix ms timestamp for countdown timer
  supplierEmail: string;
  supplierName: string;
  clientEmail?: string; // email of the client who placed the order
  amount: string;       // what the customer paid (gross)
  netAmount: string;    // what the supplier receives after 9% fee
  status: "Completed" | "Processing" | "Unpaid";
  date: string;
}

const COMMISSION = 0.09; // 9%

const USERS_KEY        = "tbc_users";
const SESSION_KEY      = "tbc_session";
const ORDERS_KEY       = "tbc_orders";
const SEED_VER_KEY     = "tbc_seed_ver";
const SUPPLIER_CODE_KEY = "tbc_supplier_code";
const SEED_VER = "8"; // bump to force re-seed

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calcNet(grossStr: string): string {
  const gross = parseFloat(grossStr.replace(/[$,]/g, ""));
  return formatUSD(gross * (1 - COMMISSION));
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function getSupplierCode(): string {
  let code = localStorage.getItem(SUPPLIER_CODE_KEY);
  if (!code) {
    code = generateCode();
    localStorage.setItem(SUPPLIER_CODE_KEY, code);
  }
  return code;
}

export function regenerateSupplierCode(): string {
  const code = generateCode();
  localStorage.setItem(SUPPLIER_CODE_KEY, code);
  return code;
}

// Seed admin on first load
function seed() {
  if (!localStorage.getItem(USERS_KEY)) {
    const users: User[] = [
      { email: "support@10bottlevalue.co", password: "Admin123!", name: "Admin", role: "admin" },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
  // Ensure supplier code exists
  getSupplierCode();
}

// Seed demo orders — re-seeds when SEED_VER changes
function seedDemoOrders() {
  if (localStorage.getItem(SEED_VER_KEY) === SEED_VER) return;

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const supplier = users.find(u => u.email === "123@inbox.lv");

  const existing: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  let orders = existing.filter(o => o.supplierEmail !== "123@inbox.lv" && o.clientEmail !== "321@inbox.lv");

  // Supplier demo orders
  if (supplier) {
    const supplierDemo: Order[] = [
      { id: "INV-FK42N5C9", orderNumber: "ORD-2248", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$1,240.00", netAmount: calcNet("$1,240.00"), status: "Completed",  date: "Jul 14, 2026 · 11:24 AM" },
      { id: "INV-T8RW2JPQ", orderNumber: "ORD-1873", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$875.50",   netAmount: calcNet("$875.50"),   status: "Processing", date: "Jul 13, 2026 · 03:47 PM" },
      { id: "INV-9CZM4VBX", orderNumber: "ORD-3091", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$3,100.00", netAmount: calcNet("$3,100.00"), status: "Completed",  date: "Jul 12, 2026 · 09:05 AM" },
      { id: "INV-L6YH3DK1", orderNumber: "ORD-0562", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$560.00",   netAmount: calcNet("$560.00"),   status: "Processing", date: "Jul 11, 2026 · 06:32 PM" },
      { id: "INV-A5NP7GR0", orderNumber: "ORD-4417", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$2,450.75", netAmount: calcNet("$2,450.75"), status: "Completed",  date: "Jul 10, 2026 · 02:18 PM" },
    ];
    orders = [...supplierDemo, ...orders];
  }

  // Client demo orders for 321@inbox.lv
  const clientDemoSupplierName = supplier ? supplier.name : "Valley Distributors";
  const clientDemoSupplierEmail = "123@inbox.lv";
  const clientDemo: Order[] = [
    { id: "INV-CL7X3QPM", orderNumber: "ORD-8812", supplierEmail: clientDemoSupplierEmail, supplierName: clientDemoSupplierName, clientEmail: "321@inbox.lv", amount: "$2,000.00", netAmount: calcNet("$2,000.00"), status: "Completed",  date: "Jul 14, 2026 · 10:00 AM" },
    { id: "INV-CL2B9FNA", orderNumber: "ORD-9931", supplierEmail: clientDemoSupplierEmail, supplierName: clientDemoSupplierName, clientEmail: "321@inbox.lv", amount: "$450.00",   netAmount: calcNet("$450.00"),   status: "Processing", date: "Jul 13, 2026 · 02:15 PM" },
    { id: "INV-CL5R1ZKW", orderNumber: "ORD-7754", supplierEmail: clientDemoSupplierEmail, supplierName: clientDemoSupplierName, clientEmail: "321@inbox.lv", amount: "$1,800.00", netAmount: calcNet("$1,800.00"), status: "Completed",  date: "Jul 11, 2026 · 09:30 AM" },
  ];
  orders = [...clientDemo, ...orders];

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(SEED_VER_KEY, SEED_VER);
}

export function initAuth() {
  seed();
  seedDemoOrders();
}

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getOrders(): Order[] {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  return orders.map(o => ({ ...o, netAmount: calcNet(o.amount) }));
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Register a client (no code required). Returns false if email already taken. */
export function registerClient(email: string, password: string, name: string): boolean {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return false;
  users.push({ email, password, name, role: "client" });
  saveUsers(users);
  return true;
}

/** Register a supplier using the invite code. Returns "ok" | "badCode" | "emailTaken" */
export function registerSupplier(email: string, password: string, name: string, code: string): "ok" | "badCode" | "emailTaken" {
  const stored = getSupplierCode();
  if (code.trim().toUpperCase() !== stored.toUpperCase()) return "badCode";
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return "emailTaken";
  users.push({ email, password, name, role: "supplier" });
  saveUsers(users);
  return "ok";
}

/** Admin: create supplier directly (no code needed). */
export function createSupplier(email: string, password: string, name: string): boolean {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return false;
  users.push({ email, password, name, role: "supplier" });
  saveUsers(users);
  return true;
}

export function deleteSupplier(email: string) {
  const users = getUsers().filter((u) => u.email !== email);
  saveUsers(users);
  const orders = getOrders().filter((o) => o.supplierEmail !== email);
  saveOrders(orders);
}

export function deleteUser(email: string) {
  const users = getUsers().filter((u) => u.email !== email);
  saveUsers(users);
}

/** Find a supplier by display name (case-insensitive). Returns null if not found. */
export function findSupplierByName(name: string): User | null {
  const users = getUsers();
  return users.find(u => u.role === "supplier" && u.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
}

function genInvId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return "INV-" + suffix;
}

export function updateOrderStatus(id: string, status: Order["status"]) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    saveOrders(orders);
  }
}

export function addOrder(order: Omit<Order, "id" | "date" | "netAmount">): Order {
  const orders = getOrders();
  const gross = order.amount.startsWith("$") ? order.amount : "$" + order.amount;
  const newOrder: Order = {
    ...order,
    amount: gross,
    netAmount: calcNet(gross),
    id: genInvId(),
    createdAt: Date.now(),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      + " · " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}
