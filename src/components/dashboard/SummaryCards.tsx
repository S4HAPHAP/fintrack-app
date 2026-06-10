"use client";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";
import type { FinanceSummary } from "@/types";

export function SummaryCards({ summary }: { summary: FinanceSummary }) {
  const { t } = useLanguage();

  const cards = [
    {
      key: "income" as const,
      label: t.totalIncome,
      icon: "📈",
      accent: "text-emerald-700",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/60",
      border: "border-emerald-200",
      bar: "bg-emerald-500",
    },
    {
      key: "expense" as const,
      label: t.totalExpense,
      icon: "📉",
      accent: "text-rose-700",
      bg: "bg-gradient-to-br from-rose-50 to-rose-100/60",
      border: "border-rose-200",
      bar: "bg-rose-500",
    },
    {
      key: "profitLoss" as const,
      label: t.profitLoss,
      icon: "💰",
      accent: "text-indigo-700",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/60",
      border: "border-indigo-200",
      bar: "bg-indigo-500",
    },
  ];

  const maxVal = Math.max(summary.income, summary.expense, Math.abs(summary.profitLoss), 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const value = summary[card.key];
        const isNeg = card.key === "profitLoss" && value < 0;
        const accentClass = isNeg ? "text-rose-700" : card.accent;
        const bgClass = isNeg ? "bg-gradient-to-br from-rose-50 to-rose-100/60" : card.bg;
        const borderClass = isNeg ? "border-rose-200" : card.border;
        const barClass = isNeg ? "bg-rose-500" : card.bar;
        const barWidth = `${Math.round((Math.abs(value) / maxVal) * 100)}%`;

        return (
          <div key={card.key}
            className={`rounded-2xl border p-5 ${bgClass} ${borderClass} shadow-sm transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${accentClass}`}>
              {isNeg ? "-" : ""}{formatCurrency(Math.abs(value))}
            </p>
            {/* Mini bar */}
            <div className="mt-4 h-1.5 rounded-full bg-black/10">
              <div className={`h-1.5 rounded-full ${barClass} transition-all`} style={{ width: barWidth }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
