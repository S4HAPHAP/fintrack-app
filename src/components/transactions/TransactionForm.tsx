"use client";
import { FormEvent, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase/client";
import type { Category, TransactionType } from "@/types";

interface UserCompany { id: string; name: string; code: string; is_primary: boolean; }

interface TransactionFormProps {
  onSubmit: (data: {
    date: string; type: TransactionType; category: string;
    amount: number; note: string; projectName: string; companyId: string | null;
  }) => void | Promise<void>;
  projects?: string[];
  categories?: Category[];
}

const defaultDate = () => new Date().toISOString().split("T")[0];

export function TransactionForm({ onSubmit, projects = [], categories = [] }: TransactionFormProps) {
  const { t, lang } = useLanguage();
  const [type, setType] = useState<TransactionType>("income");
  const [category, setCategory] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's companies
  useEffect(() => {
    void (async () => {
      try {
        const { data } = await supabase.rpc("get_my_companies");
        if (data && (data as UserCompany[]).length > 0) {
          const list = data as UserCompany[];
          setUserCompanies(list);
          const primary = list.find((c) => c.is_primary) ?? list[0];
          setCompanyId(primary.id);
        }
      } catch {
        // function may not exist yet — safe to ignore
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory(lang === "th" ? filteredCategories[0].name_th : filteredCategories[0].name_en);
    }
  }, [type, categories, lang]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const amount = Number(form.get("amount"));
    const projectName = String(form.get("projectName") ?? "").trim();

    if (!companyId) { setError(t.companyRequired); return; }
    if (!amount || amount <= 0) { setError(lang === "th" ? "กรุณากรอกจำนวนเงินที่ถูกต้อง" : "Please enter a valid amount."); return; }
    if (!projectName) { setError(lang === "th" ? "กรุณากรอกชื่อโปรเจกต์" : "Project name is required."); return; }

    try {
      await onSubmit({
        date: String(form.get("date")),
        type, category, amount,
        note: String(form.get("note") ?? "").trim(),
        projectName,
        companyId: companyId || null,
      });
      formEl.reset();
      setType("income");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transaction.");
    }
  };

  return (
    <Card>
      <h2 className="mb-5 text-lg font-semibold text-slate-900">{t.addTransaction}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Company selector — required, always at top */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            {t.company} <span className="text-rose-500">*</span>
          </label>
          {loadingCompanies ? (
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ) : userCompanies.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              {t.noCompanyAssigned}
            </p>
          ) : (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">{t.noCompany}</option>
              {userCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}){c.is_primary ? " ★" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t.date} name="date" type="date" defaultValue={defaultDate()} required />
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700">{t.type}</span>
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setType(opt)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${type === opt ? (opt === "income" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700") : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {opt === "income" ? t.income : t.expense}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t.category}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              {filteredCategories.map((c) => (
                <option key={c.id} value={lang === "th" ? c.name_th : c.name_en}>
                  {lang === "th" ? `${c.name_th} / ${c.name_en}` : `${c.name_en} / ${c.name_th}`}
                </option>
              ))}
            </select>
          </div>
          <Input label={t.amount} name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700">{t.projectName}</label>
            <input id="projectName" name="projectName" list="project-list" placeholder={t.projectPlaceholder} required
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {projects.length > 0 && <datalist id="project-list">{projects.map((p) => <option key={p} value={p} />)}</datalist>}
          </div>
          <Input label={t.note} name="note" placeholder={t.notePlaceholder} />
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Button type="submit" className="w-full sm:w-auto" disabled={userCompanies.length === 0}>
          {t.addBtn}
        </Button>
      </form>
    </Card>
  );
}
