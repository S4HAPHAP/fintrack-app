export type TransactionType = "income" | "expense";
export type UserRole = "admin" | "user";


export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  note: string;
  projectName: string;
  companyName?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  profitLoss: number;
}

export interface Category {
  id: string;
  name_en: string;
  name_th: string;
  type: TransactionType;
  sort_order: number;
  is_active: boolean;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  company_id: string | null;
  company_name: string | null;
  created_at: string;
}
