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
    signIn: "登 录",
    signOut: "退出登录",
    signUp: "注 册",
    back: "← 返回首页",

    // Home
    supplierName: "供应商名称",
    orderNumber: "订单编号",
    amount: "付款金额",
    payWithCashApp: "$ 通过 Cash App 立即付款",

    // Sign in
    signInTitle: "登录您的账户",
    signInSub: "欢迎回到 10BottleCash 供应商平台",
    emailAddress: "电子邮件地址",
    password: "登录密码",
    wrongCredentials: "邮箱或密码不正确，请重试",

    // Dashboard
    myOrders: "我的订单列表",
    myOrdersSub: "以下是您通过 10BottleCash 平台的全部付款记录",
    totalOrders: "订单总数",
    paid: "已完成付款",
    inProgress: "处理中",
    noOrders: "暂无订单记录",
    orderId: "系统订单 ID",
    orderNum: "订单编号",
    supplierNameCol: "供应商",
    amountCol: "付款金额",
    statusCol: "订单状态",
    dateCol: "创建日期",

    // Admin
    admin: "管理员",
    suppliers: "供应商管理",
    orders: "订单管理",
    newSupplier: "添加新供应商",
    companyName: "公司 / 供应商名称",
    createAccount: "创建登录账户",
    allSuppliers: "全部供应商",
    delete: "删除",
    addOrder: "新增订单",
    selectSupplier: "请选择供应商",
    allOrders: "全部订单",
    searchPlaceholder: "🔍  搜索：订单ID、供应商名称、订单编号、金额、状态...",
    allStatuses: "全部状态",
    allSuppliersFilt: "全部供应商",
    reset: "清空筛选",
    found: "搜索结果",
    of: "共",
    noOrdersFound: "未找到符合条件的订单",
    noOrdersYet: "暂无订单记录",
    noSuppliersYet: "暂无供应商，请先添加",
    fillAllFields: "请填写所有必填字段",
    emailExists: "该邮箱已被注册，请使用其他邮箱",
    accountCreated: "账户创建成功",
    orderAdded: "订单已成功添加",
    deleteConfirm: "确认删除供应商",
    passwordLabel: "登录密码",
    confirmDelete: "确认删除供应商",
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
  Unpaid:     { en: "Unpaid",     zh: "未支付" },
};
