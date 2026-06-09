"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/supabase/categories";
import type { Category, TransactionType } from "@/types";

export default function AdminCategoriesPage() {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameTh.trim()) return;
    setSaving(true);
    try {
      const maxOrder = Math.max(0, ...categories.filter((c) => c.type === type).map((c) => c.sort_order));
      const created = await createCategory({
        name_en: nameEn.trim(),
        name_th: nameTh.trim(),
        type,
        sort_order: maxOrder + 1,
      });
      setCategories((prev) => [...prev, created]);
      setNameEn("");
      setNameTh("");
      setMsg(t.success);
    } catch (err) {
      setMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { is_active: !cat.is_active });
      setCategories((prev) =>
        prev.map((c) => c.id === cat.id ? { ...c, is_active: !c.is_active } : c)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const incomeList = categories.filter((c) => c.type === "income");
  const expenseList = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.categories}</h1>

      {msg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>
      )}

      {/* Add form */}
      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">{t.addCategory}</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t.nameEn}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Travel"
              required
            />
            <Input
              label={t.nameTh}
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="ค่าเดินทาง"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setType(tp)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    type === tp
                      ? tp === "income"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {tp === "income" ? t.income : t.expense}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={saving}>{t.add}</Button>
          </div>
        </form>
      </Card>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { label: t.income, list: incomeList, color: "emerald" },
          { label: t.expense, list: expenseList, color: "rose" },
        ].map(({ label, list, color }) => (
          <Card key={label}>
            <h2 className="mb-4 font-semibold text-slate-900">{label}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="pb-2 pr-3">EN / TH</th>
                  <th className="pb-2 pr-3">{t.active}</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium">{c.name_en}</p>
                      <p className="text-slate-500">{c.name_th}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {c.is_active ? "✓" : "✗"}
                      </button>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs"
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
