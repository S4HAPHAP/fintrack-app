"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchAllUsers,
  updateUserRole,
  addUserCompany,
  removeUserCompany,
  type AdminUser,
} from "@/lib/supabase/admin";
import { fetchCompanies } from "@/lib/supabase/companies";
import type { Company, UserRole } from "@/types";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2500);
  };

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch((e) => showMsg(e.message, false));
    fetchCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setSaving(userId + "_role");
    try {
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      showMsg(t.success);
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Error", false);
    } finally { setSaving(null); }
  };

  const handleAddCompany = async (userId: string, companyId: string) => {
    if (!companyId) return;
    setSaving(userId + "_add");
    try {
      const user = users.find((u) => u.id === userId)!;
      const isPrimary = user.companies.length === 0;
      await addUserCompany(userId, companyId, isPrimary);
      const company = companies.find((c) => c.id === companyId)!;
      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, companies: [...u.companies, { id: companyId, name: company.name, code: company.code, is_primary: isPrimary }] }
          : u
      ));
      showMsg(t.success);
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Error", false);
    } finally { setSaving(null); }
  };

  const handleRemoveCompany = async (userId: string, companyId: string) => {
    setSaving(userId + companyId);
    try {
      await removeUserCompany(userId, companyId);
      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, companies: u.companies.filter((c) => c.id !== companyId) }
          : u
      ));
      showMsg(t.success);
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Error", false);
    } finally { setSaving(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t.users}</h1>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          {t.totalUsers}: {users.length}
        </span>
      </div>

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        {users.map((u) => {
          const assignedIds = new Set(u.companies.map((c) => c.id));
          const availableCompanies = companies.filter((c) => !assignedIds.has(c.id));

          return (
            <Card key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* User info */}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{u.full_name || "—"}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.userJoined}: {new Date(u.created_at).toLocaleDateString("th-TH")}
                  </p>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{t.userRole}:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    disabled={saving === u.id + "_role"}
                    className="rounded border border-slate-200 px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Companies */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm font-medium text-slate-700">{t.userCompany}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {u.companies.length === 0 && (
                    <span className="text-sm text-slate-400">— ยังไม่ได้กำหนดบริษัท —</span>
                  )}
                  {u.companies.map((c) => (
                    <span
                      key={c.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        c.is_primary
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.is_primary && <span>★</span>}
                      {c.name} ({c.code})
                      <button
                        onClick={() => handleRemoveCompany(u.id, c.id)}
                        disabled={saving === u.id + c.id}
                        className="ml-1 text-slate-400 hover:text-rose-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add company */}
                {availableCompanies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) handleAddCompany(u.id, e.target.value);
                        e.target.value = "";
                      }}
                      disabled={saving === u.id + "_add"}
                      className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-600"
                    >
                      <option value="">+ เพิ่มบริษัท</option>
                      {availableCompanies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {users.length === 0 && (
          <Card>
            <p className="text-center text-slate-400 py-4">{t.loading}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
