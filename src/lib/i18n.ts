export type Lang = "th" | "en";

export interface Translations {
  dashboard: string; transactions: string; admin: string; signOut: string;
  login: string; signup: string; email: string; password: string;
  fullName: string; loginTitle: string; signupTitle: string;
  noAccount: string; hasAccount: string;
  welcomeBack: string; totalIncome: string; totalExpense: string;
  profitLoss: string; recentTransactions: string;
  noTransactions: string; viewAll: string;
  filterByProject: string; allProjects: string;
  addTransaction: string; addTransactionNav: string; date: string; type: string;
  income: string; expense: string; category: string; amount: string;
  projectName: string; note: string; notePlaceholder: string;
  projectPlaceholder: string; addBtn: string;
  company: string; selectCompany: string; noCompany: string;
  companyRequired: string; noCompanyAssigned: string;
  transactionList: string; transactionCount: (n: number) => string;
  dateCol: string; typeCol: string; categoryCol: string;
  projectCol: string; noteCol: string; amountCol: string; companyCol: string; createdByCol: string; createdAtCol: string; deleteBtn: string;
  noData: string; noDataFilter: string;
  adminPanel: string; users: string; companies: string; categories: string;
  totalUsers: string; userName: string; userEmail: string; userRole: string;
  userCompany: string; userJoined: string; saveChanges: string;
  companyName: string; companyCode: string; addCompany: string;
  nameEn: string; nameTh: string; active: string; addCategory: string;
  save: string; cancel: string; delete: string; edit: string; add: string;
  loading: string; success: string; confirmDelete: string;
  backToList: string;
}

const en: Translations = {
  dashboard: "Dashboard", transactions: "Transactions", admin: "Admin", signOut: "Sign out",
  login: "Sign In", signup: "Create Account", email: "Email", password: "Password",
  fullName: "Full name", loginTitle: "Welcome back", signupTitle: "Create your account",
  noAccount: "Don't have an account?", hasAccount: "Already have an account?",
  welcomeBack: "Welcome back", totalIncome: "Total Income", totalExpense: "Total Expenses",
  profitLoss: "Profit / Loss", recentTransactions: "Recent Transactions",
  noTransactions: "No transactions yet", viewAll: "View all",
  filterByProject: "Filter by project", allProjects: "All Projects",
  addTransaction: "Add Transaction", addTransactionNav: "+ Add Transaction", date: "Date", type: "Type",
  income: "Income", expense: "Expense", category: "Category", amount: "Amount",
  projectName: "Project name", note: "Note", notePlaceholder: "Optional description",
  projectPlaceholder: "e.g. Acme Corp", addBtn: "Save Transaction",
  company: "Company", selectCompany: "— Select company —", noCompany: "— Select company —",
  companyRequired: "Please select a company.", noCompanyAssigned: "No company assigned. Contact admin.",
  transactionList: "Transaction List", transactionCount: (n) => `${n} transaction${n !== 1 ? "s" : ""}`,
  dateCol: "Date", typeCol: "Type", categoryCol: "Category",
  projectCol: "Project", noteCol: "Note", amountCol: "Amount", companyCol: "Company", createdByCol: "Created by", createdAtCol: "Created at", deleteBtn: "Delete",
  noData: "No transactions found", noDataFilter: "No transactions match the current filter.",
  adminPanel: "Admin Panel", users: "Users", companies: "Companies", categories: "Categories",
  totalUsers: "Total Users", userName: "Name", userEmail: "Email", userRole: "Role",
  userCompany: "Company", userJoined: "Joined", saveChanges: "Save",
  companyName: "Company Name", companyCode: "Code", addCompany: "Add Company",
  nameEn: "English Name", nameTh: "Thai Name", active: "Active", addCategory: "Add Category",
  save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add",
  loading: "Loading...", success: "Saved successfully", confirmDelete: "Are you sure you want to delete this?",
  backToList: "← Back to list",
};

const th: Translations = {
  dashboard: "แดชบอร์ด", transactions: "รายการเงิน", admin: "จัดการระบบ", signOut: "ออกจากระบบ",
  login: "เข้าสู่ระบบ", signup: "สมัครใช้งาน", email: "อีเมล", password: "รหัสผ่าน",
  fullName: "ชื่อ-นามสกุล", loginTitle: "ยินดีต้อนรับกลับ", signupTitle: "สร้างบัญชีใหม่",
  noAccount: "ยังไม่มีบัญชี?", hasAccount: "มีบัญชีอยู่แล้ว?",
  welcomeBack: "ยินดีต้อนรับ", totalIncome: "รายรับทั้งหมด", totalExpense: "รายจ่ายทั้งหมด",
  profitLoss: "กำไร / ขาดทุน", recentTransactions: "รายการล่าสุด",
  noTransactions: "ยังไม่มีรายการ", viewAll: "ดูทั้งหมด",
  filterByProject: "กรองตามโปรเจกต์", allProjects: "ทุกโปรเจกต์",
  addTransaction: "เพิ่มรายการ", addTransactionNav: "+ เพิ่มรายการ", date: "วันที่", type: "ประเภท",
  income: "รายรับ", expense: "รายจ่าย", category: "หมวดหมู่", amount: "จำนวนเงิน",
  projectName: "ชื่อโปรเจกต์", note: "หมายเหตุ", notePlaceholder: "รายละเอียดเพิ่มเติม (ถ้ามี)",
  projectPlaceholder: "เช่น โปรเจกต์ A", addBtn: "บันทึกรายการ",
  company: "บริษัท", selectCompany: "— เลือกบริษัท —", noCompany: "— เลือกบริษัท —",
  companyRequired: "กรุณาเลือกบริษัท", noCompanyAssigned: "ยังไม่ได้รับมอบหมายบริษัท กรุณาติดต่อ Admin",
  transactionList: "รายการทั้งหมด", transactionCount: (n) => `${n} รายการ`,
  dateCol: "วันที่", typeCol: "ประเภท", categoryCol: "หมวดหมู่",
  projectCol: "โปรเจกต์", noteCol: "หมายเหตุ", amountCol: "จำนวน", companyCol: "บริษัท", createdByCol: "ผู้สร้าง", createdAtCol: "วันที่สร้าง", deleteBtn: "ลบ",
  noData: "ไม่พบรายการ", noDataFilter: "ไม่พบรายการที่ตรงกับตัวกรอง",
  adminPanel: "จัดการระบบ", users: "ผู้ใช้งาน", companies: "บริษัท", categories: "หมวดหมู่",
  totalUsers: "จำนวนผู้ใช้", userName: "ชื่อ", userEmail: "อีเมล", userRole: "สิทธิ์",
  userCompany: "บริษัท", userJoined: "สมัครเมื่อ", saveChanges: "บันทึก",
  companyName: "ชื่อบริษัท", companyCode: "รหัสบริษัท", addCompany: "เพิ่มบริษัท",
  nameEn: "ชื่อภาษาอังกฤษ", nameTh: "ชื่อภาษาไทย", active: "ใช้งาน", addCategory: "เพิ่มหมวดหมู่",
  save: "บันทึก", cancel: "ยกเลิก", delete: "ลบ", edit: "แก้ไข", add: "เพิ่ม",
  loading: "กำลังโหลด...", success: "บันทึกสำเร็จ", confirmDelete: "ต้องการลบรายการนี้ใช่หรือไม่?",
  backToList: "← กลับไปรายการ",
};

export function getTranslations(lang: Lang): Translations {
  return lang === "th" ? th : en;
}
