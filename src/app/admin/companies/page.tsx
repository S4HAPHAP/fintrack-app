"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { fetchCompanies, createCompany, deleteCompany } from "@/lib/supabase/companies";
import type { Company } from "@/types";

export default function AdminCompaniesPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      const created = await createCompany({ name: name.trim(), code: code.trim().toUpperCase() });
      setCompanies((prev) => [...prev, created]);
      setName("");
      setCode("");
      setMsg(t.success);
    } catch (err) {
      setMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.companies}</h1>

      {msg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>
      )}

      {/* Add form */}
      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">{t.addCompany}</h2>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <Input
              label={t.companyName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="South City Group"
              required
            />
          </div>
          <div className="w-32">
            <Input
              label={t.companyCode}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SCG"
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving}>{t.add}</Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="pb-3 pr-4">{t.companyName}</th>
              <th className="pb-3 pr-4">{t.companyCode}</th>
              <th className="pb-3">{t.delete}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="py-3 pr-4 font-medium text-slate-900">{c.name}</td>
                <td className="py-3 pr-4">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono">{c.code}</span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-rose-600 hover:text-rose-800 text-xs"
                  >
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
