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
    supplierNotFound: "Supplier not found. Please check the supplier name.",
    fillAllFieldsValid: "Please fill in all fields with valid values.",
    redirectingToCash: "Redirecting to Cash App…",
    enterSupplierFirst: "Enter supplier name first",
    enterSupplierPlaceholder: "Enter supplier name",
    maxAmountError: "Maximum amount is $999",
    minAmountError: "Minimum amount is $0.01",

    // Sign in
    signInTitle: "Sign in to your account",
    signInSub: "Welcome back to 10BottleCash",
    emailAddress: "Email Address",
    password: "Password",
    wrongCredentials: "Invalid email or password",
    signingIn: "Signing in…",
    noAccount: "Don't have an account?",
    signUpNow: "Sign up",

    // Sign up
    createAccountTitle: "Create account",
    joinSub: "Join 10BottleCash",
    confirmPassword: "Confirm password",
    repeatPassword: "Repeat your password",
    atLeast6Chars: "At least 6 characters",
    roleClient: "Client",
    roleSupplier: "Supplier",
    createAccountBtn: "Create Account",
    joinAsSupplierBtn: "Join as Supplier",
    creatingAccount: "Creating account…",
    alreadyHaveAccount: "Already have an account?",
    signInNow: "Sign in",
    inviteCodeHint: "Contact support@10bottlevalue.co to get the code.",
    tenLetterCode: "10-letter code",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 6 characters.",
    enterCompanyName: "Please enter your company name.",
    enterInviteCode: "Please enter the supplier invite code.",
    badCodeMsg: "Invalid supplier code. Please contact support@10bottlevalue.co",
    emailTakenMsg: "This email is already registered.",
    somethingWrong: "Something went wrong. Please try again.",
    companyName: "Company Name",
    supplierInviteCodeLabel: "Supplier invite code",

    // Order confirmed
    paymentConfirmed: "PAYMENT CONFIRMED",
    txComplete: "TRANSACTION COMPLETE",
    statusCompleted: "Completed",
    supplierNotified: "The supplier has been notified of your payment.",
    makeAnotherPayment: "Make Another Payment",
    supplierLabel: "SUPPLIER",

    // Payment cancelled
    paymentExpiredTitle: "PAYMENT EXPIRED",
    paymentFailedTitle: "PAYMENT FAILED",
    paymentCancelledTitle: "PAYMENT CANCELLED",
    paymentExpiredMsg: "The payment session timed out. Please start a new payment.",
    paymentFailedMsg: "The payment could not be processed. Please try again.",
    paymentCancelledMsg: "You cancelled the payment. No funds have been charged.",
    noFundsCharged: "No funds have been deducted from your account. Your order has been marked as",
    unpaidLabel: "Unpaid",
    tryAgainBtn: "Try Again",
    backToHomeBtn: "Back to Home",

    // Payment return
    verifyingPayment: "Verifying payment…",

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
    usersTab: "Users",
    supplierInviteCode: "Supplier Invite Code",
    inviteCodeDescAdmin: "Give this code to suppliers so they can self-register via the Sign Up page. Regenerating will invalidate the old code.",
    regenerateCode: "↻ Regenerate Code",
    nameCol: "Name",
    emailCol: "Email",
    noClientsYet: "No clients registered yet.",
    noSuppliersRegistered: "No suppliers registered yet.",
    orderNumberLabel: "Order Number",
    supplierReceives: "Supplier receives:",
    afterFee: "(after 9% fee)",
    generateNewCodeConfirm: "Generate a new supplier invite code? The old code will stop working.",
    deleteUserConfirm: "Delete",
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
    supplierNotFound: "未找到该供应商，请检查供应商名称",
    fillAllFieldsValid: "请填写所有字段并确保数值有效",
    redirectingToCash: "正在跳转至 Cash App…",
    enterSupplierFirst: "请先输入供应商名称",
    enterSupplierPlaceholder: "输入供应商名称",
    maxAmountError: "最高金额为 $999",
    minAmountError: "最低金额为 $0.01",

    // Sign in
    signInTitle: "登录您的账户",
    signInSub: "欢迎回到 10BottleCash 供应商平台",
    emailAddress: "电子邮件地址",
    password: "登录密码",
    wrongCredentials: "邮箱或密码不正确，请重试",
    signingIn: "登录中…",
    noAccount: "没有账户？",
    signUpNow: "注册",

    // Sign up
    createAccountTitle: "创建账户",
    joinSub: "加入 10BottleCash",
    confirmPassword: "确认密码",
    repeatPassword: "请再次输入密码",
    atLeast6Chars: "至少6个字符",
    roleClient: "客户",
    roleSupplier: "供应商",
    createAccountBtn: "创建账户",
    joinAsSupplierBtn: "注册为供应商",
    creatingAccount: "正在创建账户…",
    alreadyHaveAccount: "已有账户？",
    signInNow: "登录",
    inviteCodeHint: "请联系 support@10bottlevalue.co 获取邀请码",
    tenLetterCode: "10位邀请码",
    passwordMismatch: "两次密码不一致",
    passwordTooShort: "密码至少需要6个字符",
    enterCompanyName: "请输入公司名称",
    enterInviteCode: "请输入供应商邀请码",
    badCodeMsg: "邀请码无效，请联系 support@10bottlevalue.co",
    emailTakenMsg: "该邮箱已被注册",
    somethingWrong: "发生错误，请重试",
    companyName: "公司 / 供应商名称",
    supplierInviteCodeLabel: "供应商邀请码",

    // Order confirmed
    paymentConfirmed: "付款已确认",
    txComplete: "交易完成",
    statusCompleted: "已完成",
    supplierNotified: "供应商已收到您的付款通知",
    makeAnotherPayment: "发起新付款",
    supplierLabel: "供应商",

    // Payment cancelled
    paymentExpiredTitle: "付款已过期",
    paymentFailedTitle: "付款失败",
    paymentCancelledTitle: "付款已取消",
    paymentExpiredMsg: "付款会话已超时，请重新发起付款",
    paymentFailedMsg: "付款处理失败，请重试",
    paymentCancelledMsg: "您已取消付款，未产生任何费用",
    noFundsCharged: "未从您的账户扣款，订单状态已标记为",
    unpaidLabel: "未支付",
    tryAgainBtn: "重试",
    backToHomeBtn: "返回首页",

    // Payment return
    verifyingPayment: "正在验证付款…",

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
    usersTab: "用户",
    supplierInviteCode: "供应商邀请码",
    inviteCodeDescAdmin: "将此邀请码发送给供应商，让其通过注册页面自助注册。重新生成后旧码将立即失效",
    regenerateCode: "↻ 重新生成邀请码",
    nameCol: "姓名",
    emailCol: "邮箱",
    noClientsYet: "暂无客户注册",
    noSuppliersRegistered: "暂无供应商注册",
    orderNumberLabel: "订单编号",
    supplierReceives: "供应商收款：",
    afterFee: "（扣除9%手续费后）",
    generateNewCodeConfirm: "生成新的供应商邀请码？旧码将立即失效",
    deleteUserConfirm: "删除",
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
