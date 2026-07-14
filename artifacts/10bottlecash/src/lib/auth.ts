export type Role = "admin" | "supplier";

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
  amount: string;       // what the customer paid (gross)
  netAmount: string;    // what the supplier receives after 9% fee
  status: "Completed" | "Processing" | "Unpaid";
  date: string;
}

const COMMISSION = 0.09; // 9%

const USERS_KEY   = "tbc_users";
const SESSION_KEY = "tbc_session";
const ORDERS_KEY  = "tbc_orders";
const SEED_VER_KEY = "tbc_seed_ver";
const SEED_VER = "6"; // bump this to force re-seed demo orders

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calcNet(grossStr: string): string {
  const gross = parseFloat(grossStr.replace(/[$,]/g, ""));
  return formatUSD(gross * (1 - COMMISSION));
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
}

// Seed demo orders for 123@inbox.lv — re-seeds when SEED_VER changes
function seedDemoOrders() {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const supplier = users.find(u => u.email === "123@inbox.lv");
  if (!supplier) return;

  // Already on latest version — skip
  if (localStorage.getItem(SEED_VER_KEY) === SEED_VER) return;

  const demo: Order[] = [
    { id: "INV-FK42N5C9", orderNumber: "ORD-2248", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$1,240.00", netAmount: calcNet("$1,240.00"), status: "Completed",  date: "Jul 14, 2026 · 11:24 AM" },
    { id: "INV-T8RW2JPQ", orderNumber: "ORD-1873", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$875.50",   netAmount: calcNet("$875.50"),   status: "Processing", date: "Jul 13, 2026 · 03:47 PM" },
    { id: "INV-9CZM4VBX", orderNumber: "ORD-3091", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$3,100.00", netAmount: calcNet("$3,100.00"), status: "Completed",  date: "Jul 12, 2026 · 09:05 AM" },
    { id: "INV-L6YH3DK1", orderNumber: "ORD-0562", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$560.00",   netAmount: calcNet("$560.00"),   status: "Processing", date: "Jul 11, 2026 · 06:32 PM" },
    { id: "INV-A5NP7GR0", orderNumber: "ORD-4417", supplierEmail: "123@inbox.lv", supplierName: supplier.name, amount: "$2,450.75", netAmount: calcNet("$2,450.75"), status: "Completed",  date: "Jul 10, 2026 · 02:18 PM" },
  ];

  // Keep non-demo orders, replace demo ones
  const existing: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const nonDemo = existing.filter(o => o.supplierEmail !== "123@inbox.lv");
  localStorage.setItem(ORDERS_KEY, JSON.stringify([...demo, ...nonDemo]));
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
  // Always recompute netAmount from amount so old/missing values are never stale
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
