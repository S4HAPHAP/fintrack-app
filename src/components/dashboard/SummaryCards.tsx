"use client";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";
import type { FinanceSummary } from "@/types";

export function SummaryCards({ summary }: { summary: FinanceSummary }) {
  const { t } = useLanguage();
  const cards = [
    { key: "income" as const,    label: t.totalIncome,  accent: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { key: "expense" as const,   label: t.totalExpense, accent: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100" },
    { key: "profitLoss" as const, label: t.profitLoss,  accent: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const value = summary[card.key];
        const neg = card.key === "profitLoss" && value < 0;
        return (
          <Card key={card.key} className={`${neg ? "bg-rose-50 border-rose-100" : card.bg + " " + card.border}`}>
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${neg ? "text-rose-600" : card.accent}`}>
              {formatCurrency(value)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
