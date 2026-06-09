"use client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";
import type { Transaction } from "@/types";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  const recent = transactions.slice(0, 5);
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{t.recentTransactions}</h2>
        <Link href="/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {t.viewAll}
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{t.noTransactions}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{tx.category}</p>
                <p className="truncate text-sm text-slate-500">{tx.projectName} · {formatDate(tx.date)}</p>
              </div>
              <p className={`shrink-0 text-sm font-semibold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
