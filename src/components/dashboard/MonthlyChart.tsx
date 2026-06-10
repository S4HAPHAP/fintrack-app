"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import type { Transaction } from "@/types";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

function formatK(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();

  // Build monthly data (last 6 months)
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyMap.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
    monthlyMap.set(key, entry);
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1);
      const label = date.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
      return { name: label, รายรับ: val.income, รายจ่าย: val.expense };
    });

  // Build category pie data (expense)
  const catMap = new Map<string, number>();
  transactions.filter((tx) => tx.type === "expense").forEach((tx) => {
    catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount);
  });
  const pieData = Array.from(catMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Bar Chart */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-800">📊 รายรับ-รายจ่ายรายเดือน</h2>
        {monthlyData.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูล</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(value: number) => value.toLocaleString("th-TH")}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Pie Chart */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-800">🥧 รายจ่ายตามหมวดหมู่</h2>
        {pieData.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString("th-TH")}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 min-w-[130px]">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
