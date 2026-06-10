"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { ProjectFilter } from "@/components/transactions/ProjectFilter";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";

function DashboardContent() {
  const { isLoading, summary, filteredTransactions, projects, projectFilter, setProjectFilter } = useFinance();
  const { t } = useLanguage();

  if (isLoading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.dashboard}</h1>
        <ProjectFilter projects={projects} value={projectFilter} onChange={setProjectFilter} />
      </div>
      <SummaryCards summary={summary} />
      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
