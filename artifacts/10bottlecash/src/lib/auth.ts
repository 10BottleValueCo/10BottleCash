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

// Seed admin + demo supplier on first load
function seed() {
  if (localStorage.getItem(USERS_KEY)) return;
  const users: User[] = [
    { email: "support@10bottlevalue.co", password: "Admin123!", name: "Admin", role: "admin" },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const orders: Order[] = [];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function initAuth() {
  seed();
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
