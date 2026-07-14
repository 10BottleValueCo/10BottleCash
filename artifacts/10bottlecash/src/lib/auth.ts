export type Role = "admin" | "supplier";

export interface User {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface Order {
  id: string;
  supplierEmail: string;
  supplierName: string;
  orderNumber: string;
  amount: string;
  status: "Completed" | "Pending" | "Processing";
  date: string;
}

const USERS_KEY = "tbc_users";
const SESSION_KEY = "tbc_session";
const ORDERS_KEY = "tbc_orders";

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

// Seed demo orders for 123@inbox.lv if none exist yet
function seedDemoOrders() {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const hasOrders = orders.some(o => o.supplierEmail === "123@inbox.lv");
  if (hasOrders) return;

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const supplier = users.find(u => u.email === "123@inbox.lv");
  if (!supplier) return;

  const demo: Order[] = [
    { id: "ORD-001", supplierEmail: "123@inbox.lv", supplierName: supplier.name, orderNumber: "INV-2026-041", amount: "$1,240.00", status: "Completed", date: "Jul 14, 2026" },
    { id: "ORD-002", supplierEmail: "123@inbox.lv", supplierName: supplier.name, orderNumber: "INV-2026-038", amount: "$875.50",  status: "Pending",   date: "Jul 13, 2026" },
    { id: "ORD-003", supplierEmail: "123@inbox.lv", supplierName: supplier.name, orderNumber: "INV-2026-035", amount: "$3,100.00", status: "Completed", date: "Jul 12, 2026" },
    { id: "ORD-004", supplierEmail: "123@inbox.lv", supplierName: supplier.name, orderNumber: "INV-2026-031", amount: "$560.00",  status: "Processing", date: "Jul 11, 2026" },
    { id: "ORD-005", supplierEmail: "123@inbox.lv", supplierName: supplier.name, orderNumber: "INV-2026-028", amount: "$2,450.75", status: "Completed", date: "Jul 10, 2026" },
  ];

  // Re-index existing orders and prepend demo ones
  const existing = orders.map((o, i) => ({ ...o, id: `ORD-${String(demo.length + i + 1).padStart(3, "0")}` }));
  localStorage.setItem(ORDERS_KEY, JSON.stringify([...demo, ...existing]));
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
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
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

export function addOrder(order: Omit<Order, "id" | "date">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: "ORD-" + String(orders.length + 1).padStart(3, "0"),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}
