"use client";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";
import type { Transaction } from "@/types";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{t.transactionList}</h2>
        <p className="text-sm text-slate-500">{t.transactionCount(transactions.length)}</p>
      </div>
      {transactions.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">{t.noDataFilter}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">{t.dateCol}</th>
                <th className="px-6 py-3 font-medium">{t.typeCol}</th>
                <th className="px-6 py-3 font-medium">{t.categoryCol}</th>
                <th className="px-6 py-3 font-medium">{t.companyCol}</th>
                <th className="px-6 py-3 font-medium">{t.projectCol}</th>
                <th className="px-6 py-3 font-medium">{t.noteCol}</th>
                <th className="px-6 py-3 font-medium text-right">{t.amountCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-6 py-4 text-slate-700">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {tx.type === "income" ? t.income : t.expense}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{tx.category}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{tx.companyName ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-700">{tx.projectName}</td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-slate-500">{tx.note || "—"}</td>
                  <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
