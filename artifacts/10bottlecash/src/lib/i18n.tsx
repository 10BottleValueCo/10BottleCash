import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "zh";

const t = {
  en: {
    // Nav
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    back: "← Back",

    // Home
    supplierName: "Supplier Name",
    orderNumber: "Order Number",
    amount: "Amount",
    payWithCashApp: "$ Pay With Cash App",

    // Sign in
    signInTitle: "Sign in to your account",
    signInSub: "Welcome back to 10BottleCash",
    emailAddress: "Email Address",
    password: "Password",
    wrongCredentials: "Invalid email or password",

    // Dashboard
    myOrders: "My Orders",
    myOrdersSub: "Your payment orders via 10BottleCash",
    totalOrders: "Total Orders",
    paid: "Paid",
    inProgress: "In Progress",
    noOrders: "You have no orders yet",
    orderId: "Order ID",
    orderNum: "Order Number",
    supplierNameCol: "Supplier",
    amountCol: "Amount",
    statusCol: "Status",
    dateCol: "Date",

    // Admin
    admin: "ADMIN",
    suppliers: "Suppliers",
    orders: "Orders",
    newSupplier: "New Supplier",
    companyName: "Company Name",
    createAccount: "Create Account",
    allSuppliers: "All Suppliers",
    delete: "Delete",
    addOrder: "Add Order",
    selectSupplier: "Select supplier",
    allOrders: "All Orders",
    searchPlaceholder: "🔍  Search by ID, supplier, order number, amount...",
    allStatuses: "All statuses",
    allSuppliersFilt: "All suppliers",
    reset: "Reset",
    found: "Found",
    of: "of",
    noOrdersFound: "Nothing found",
    noOrdersYet: "No orders",
    noSuppliersYet: "No suppliers yet",
    fillAllFields: "Fill in all fields",
    emailExists: "This email already exists",
    accountCreated: "Account created",
    orderAdded: "Order added",
    deleteConfirm: "Delete supplier",
    passwordLabel: "Password",
    confirmDelete: "Delete supplier",
  },
  zh: {
    // Nav
    signIn: "登录",
    signOut: "退出",
    signUp: "注册",
    back: "← 返回",

    // Home
    supplierName: "供应商名称",
    orderNumber: "订单编号",
    amount: "金额",
    payWithCashApp: "$ 通过 Cash App 付款",

    // Sign in
    signInTitle: "登录您的账户",
    signInSub: "欢迎回到 10BottleCash",
    emailAddress: "电子邮件",
    password: "密码",
    wrongCredentials: "邮箱或密码错误",

    // Dashboard
    myOrders: "我的订单",
    myOrdersSub: "您通过 10BottleCash 的付款订单",
    totalOrders: "总订单数",
    paid: "已付款",
    inProgress: "处理中",
    noOrders: "暂无订单",
    orderId: "订单 ID",
    orderNum: "订单编号",
    supplierNameCol: "供应商",
    amountCol: "金额",
    statusCol: "状态",
    dateCol: "日期",

    // Admin
    admin: "管理员",
    suppliers: "供应商",
    orders: "订单",
    newSupplier: "新供应商",
    companyName: "公司名称",
    createAccount: "创建账户",
    allSuppliers: "全部供应商",
    delete: "删除",
    addOrder: "添加订单",
    selectSupplier: "选择供应商",
    allOrders: "全部订单",
    searchPlaceholder: "🔍  按 ID、供应商、订单编号、金额搜索...",
    allStatuses: "全部状态",
    allSuppliersFilt: "全部供应商",
    reset: "重置",
    found: "找到",
    of: "共",
    noOrdersFound: "未找到结果",
    noOrdersYet: "暂无订单",
    noSuppliersYet: "暂无供应商",
    fillAllFields: "请填写所有字段",
    emailExists: "该邮箱已存在",
    accountCreated: "账户已创建",
    orderAdded: "订单已添加",
    deleteConfirm: "删除供应商",
    passwordLabel: "密码",
    confirmDelete: "删除供应商",
  },
} as const;

export type TranslationKey = keyof typeof t.en;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  tr: (key) => t.en[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem("tbc_lang") as Lang) || "en";
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("tbc_lang", l);
  };

  const tr = (key: TranslationKey): string => t[lang][key];

  return (
    <I18nContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLang() {
  return useContext(I18nContext);
}

// Status labels
export const STATUS_LABEL: Record<string, { en: string; zh: string }> = {
  Completed:  { en: "Completed",  zh: "已完成" },
  Processing: { en: "Processing", zh: "处理中" },
};
