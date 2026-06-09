import type { FinanceSummary, Transaction, TransactionType } from "@/types";

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Sales",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Supplies",
  "Payroll",
  "Marketing",
  "Travel",
  "Other Expense",
] as const;

export function getCategoriesForType(type: TransactionType): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function calculateSummary(transactions: Transaction[]): FinanceSummary {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      acc.profitLoss = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, profitLoss: 0 }
  );
}

export function getUniqueProjects(transactions: Transaction[]): string[] {
  const projects = new Set(
    transactions.map((t) => t.projectName.trim()).filter(Boolean)
  );
  return Array.from(projects).sort((a, b) => a.localeCompare(b));
}

export function filterByProject(
  transactions: Transaction[],
  project: string
): Transaction[] {
  if (!project) return transactions;
  return transactions.filter((t) => t.projectName === project);
}

export function sortTransactionsByDate(
  transactions: Transaction[]
): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
