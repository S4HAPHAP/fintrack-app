"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { ProjectFilter } from "@/components/transactions/ProjectFilter";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1,2,3].map((i) => <div key={i} className="h-28 rounded-xl bg-slate-200" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-slate-200" />
        <div className="h-72 rounded-xl bg-slate-200" />
      </div>
      <div className="h-96 rounded-xl bg-slate-200" />
    </div>
  );
}

function DashboardContent() {
  const { isLoading, summary, filteredTransactions, projects, projectFilter, setProjectFilter } = useFinance();
  const { t } = useLanguage();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.dashboard}</h1>
        <ProjectFilter projects={projects} value={projectFilter} onChange={setProjectFilter} />
      </div>
      <SummaryCards summary={summary} />
      <MonthlyChart transactions={filteredTransactions} />
      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
