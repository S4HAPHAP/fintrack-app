"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";

function AddTransactionContent() {
  const { projects, categories, addTransaction } = useFinance();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction(data);
    router.push("/transactions");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/transactions"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {t.backToList}
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.addTransaction}</h1>

      <TransactionForm
        onSubmit={handleSubmit}
        projects={projects}
        categories={categories}
      />
    </div>
  );
}

export default function AddTransactionPage() {
  return (
    <ProtectedRoute>
      <AddTransactionContent />
    </ProtectedRoute>
  );
}
