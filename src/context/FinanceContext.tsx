"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Category, Transaction } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { calculateSummary, filterByProject, getUniqueProjects, sortTransactionsByDate } from "@/lib/transactions";
import { createTransaction, fetchTransactions, removeTransaction } from "@/lib/supabase/transactions";
import { fetchCategories } from "@/lib/supabase/categories";

interface AddTransactionData extends Omit<Transaction, "id"> {
  companyId?: string | null;
}

interface FinanceContextValue {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  projectFilter: string;
  filteredTransactions: Transaction[];
  projects: string[];
  summary: ReturnType<typeof calculateSummary>;
  setProjectFilter: (project: string) => void;
  addTransaction: (data: AddTransactionData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) { setTransactions([]); setIsLoading(false); return; }
    let isMounted = true;
    setIsLoading(true);

    // Safety timeout — if Supabase hangs, stop spinner after 8s
    const timeout = setTimeout(() => {
      if (isMounted) { setTransactions([]); setIsLoading(false); }
    }, 8000);

    fetchTransactions()
      .then((data) => { if (isMounted) setTransactions(data); })
      .catch((err) => { console.error("Failed to load transactions:", err); if (isMounted) setTransactions([]); })
      .finally(() => { clearTimeout(timeout); if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [user]);

  const addTransaction = useCallback(async (data: AddTransactionData) => {
    const { companyId, ...txData } = data;
    const created = await createTransaction(txData, companyId);
    setTransactions((prev) => [created, ...prev]);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await removeTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTransactions = useMemo(
    () => sortTransactionsByDate(filterByProject(transactions, projectFilter)),
    [transactions, projectFilter]
  );
  const projects = useMemo(() => getUniqueProjects(transactions), [transactions]);
  const summary = useMemo(() => calculateSummary(filteredTransactions), [filteredTransactions]);

  const value = useMemo(() => ({
    transactions, categories, isLoading, projectFilter,
    filteredTransactions, projects, summary,
    setProjectFilter, addTransaction, deleteTransaction,
  }), [transactions, categories, isLoading, projectFilter,
       filteredTransactions, projects, summary, addTransaction, deleteTransaction]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
