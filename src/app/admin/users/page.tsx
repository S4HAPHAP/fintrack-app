"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchAllUsers, updateUserRole, addUserCompany, removeUserCompany,
  setPrimaryCompany, fetchRoleChangeLogs, fetchCompanyChangeLogs,
  type AdminUser, type RoleChangeLog, type CompanyChangeLog,
} from "@/lib/supabase/admin";
import { fetchCompanies } from "@/lib/supabase/companies";
import type { Company, UserRole } from "@/types";

const ROLE_BADGE: Record<string, string> = {
  wait: "bg-amber-100 text-amber-700",
  user: "bg-slate-100 text-slate-700",
  admin: "bg-indigo-100 text-indigo-700",
};
const ROLE_LABEL: Record<string, string> = { wait: "⏳ Wait", user: "User", admin: "Admin" };

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [logs, setLogs] = useState<RoleChangeLog[]>([]);
  const [companyLogs, setCompanyLogs] = useState<CompanyChangeLog[]>([]);
  const [logsReady, setLogsReady] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), ok ? 2500 : 6000);
  };

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch((e) => showMsg(e.message, false));
    fetchCompanies().then(setCompanies).catch(console.error);
  }, []);

  useEffect(() => {
    if (tab === "logs") {
      setLogsReady(true);
      fetchRoleChangeLogs().then(setLogs).catch(() => setLogsReady(false));
      fetchCompanyChangeLogs().then(setCompanyLogs).catch(() => {});
    }
  }, [tab]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const oldRole = users.find((u) => u.id === userId)?.role ?? "wait";
    // Optimistic update — change UI immediately
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setSaving(userId + "_role");
    try {
      await updateUserRole(userId, newRole, oldRole);
      showMsg(t.success);
    } catch (e: unknown) {
      // Revert on failure
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: oldRole } : u));
      // Supabase errors have .message but aren't instanceof Error
      const supaErr = e as Record<string, unknown>;
      const msg = (supaErr?.message as string)
        ?? (supaErr?.details as string)
        ?? (supaErr?.hint as string)
        ?? "เกิดข้อผิดพลาด";
      showMsg(`❌ ${msg}`, false);
      console.error("updateUserRole failed:", supaErr?.message, supaErr?.details, supaErr?.code);
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

  const handleSetPrimary = async (userId: string, companyId: string) => {
    setSaving(userId + companyId + "_primary");
    try {
      await setPrimaryCompany(userId, companyId);
      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, companies: u.companies.map((c) => ({ ...c, is_primary: c.id === companyId })) }
          : u
      ));
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Error", false);
    } finally { setSaving(null); }
  };

  const waitCount = users.filter((u) => u.role === "wait").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t.users}</h1>
        <div className="flex items-center gap-2">
          {waitCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              ⏳ {waitCount} รอการอนุมัติ
            </span>
          )}
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            {t.totalUsers}: {users.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(["users", "logs"] as const).map((t_) => (
          <button key={t_} onClick={() => setTab(t_)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t_
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {t_ === "users" ? "👥 ผู้ใช้งาน" : "📋 ประวัติการเปลี่ยนสิทธิ์"}
          </button>
        ))}
      </div>

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {msg.text}
        </p>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Sort: wait first */}
          {[...users].sort((a, b) => {
            const order: Record<string, number> = { wait: 0, user: 1, admin: 2 };
            return (order[a.role] ?? 1) - (order[b.role] ?? 1);
          }).map((u) => {
            const assignedIds = new Set(u.companies.map((c) => c.id));
            const availableCompanies = companies.filter((c) => !assignedIds.has(c.id));
            return (
              <Card key={u.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{u.full_name || "—"}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] ?? "bg-slate-100"}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.userJoined}: {new Date(u.created_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{t.userRole}:</span>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={saving === u.id + "_role"}
                      className={`rounded border px-2 py-1 text-sm font-medium ${ROLE_BADGE[u.role] ?? "border-slate-200"}`}
                    >
                      <option value="wait">⏳ Wait</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">{t.userCompany}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {u.companies.length === 0 && (
                      <span className="text-sm text-slate-400">— ยังไม่ได้กำหนดบริษัท —</span>
                    )}
                    {u.companies.map((c) => (
                      <span key={c.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          c.is_primary ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                        }`}>
                        <button
                          onClick={() => !c.is_primary && handleSetPrimary(u.id, c.id)}
                          disabled={c.is_primary || saving === u.id + c.id + "_primary"}
                          title={c.is_primary ? "หลัก" : "ตั้งเป็นหลัก"}
                          className={c.is_primary ? "cursor-default" : "hover:text-amber-500"}>
                          {c.is_primary ? "★" : "☆"}
                        </button>
                        {c.name} ({c.code})
                        <button onClick={() => handleRemoveCompany(u.id, c.id)}
                          disabled={saving === u.id + c.id}
                          className="ml-1 text-slate-400 hover:text-rose-600">✕</button>
                      </span>
                    ))}
                  </div>
                  {availableCompanies.length > 0 && (
                    <select defaultValue=""
                      onChange={(e) => { if (e.target.value) handleAddCompany(u.id, e.target.value); e.target.value = ""; }}
                      disabled={saving === u.id + "_add"}
                      className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-600">
                      <option value="">+ เพิ่มบริษัท</option>
                      {availableCompanies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  )}
                </div>
              </Card>
            );
          })}
          {users.length === 0 && (
            <Card><p className="text-center text-slate-400 py-4">{t.loading}</p></Card>
          )}
        </div>
      )}

      {/* Logs tab */}
      {tab === "logs" && (
        <div className="space-y-6">
          {/* Role change logs */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">🔐 ประวัติการเปลี่ยนสิทธิ์</h2>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">วันที่</th>
                      <th className="px-4 py-3 font-medium">ผู้ใช้</th>
                      <th className="px-4 py-3 font-medium">สิทธิ์เดิม</th>
                      <th className="px-4 py-3 font-medium">สิทธิ์ใหม่</th>
                      <th className="px-4 py-3 font-medium">เปลี่ยนโดย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500 text-xs">
                          {new Date(log.created_at).toLocaleString("th-TH")}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{log.user_name}</p>
                          <p className="text-xs text-slate-400">{log.user_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[log.old_role] ?? "bg-slate-100 text-slate-600"}`}>
                            {ROLE_LABEL[log.old_role] ?? log.old_role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[log.new_role] ?? "bg-slate-100 text-slate-600"}`}>
                            {ROLE_LABEL[log.new_role] ?? log.new_role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{log.changed_by_name}</td>
                      </tr>
                    ))}
                    {!logsReady && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-amber-600 text-sm">⚠️ ยังไม่ได้รัน fix_role_audit.sql</td></tr>
                    )}
                    {logsReady && logs.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">ยังไม่มีประวัติ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Company change logs */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">🏢 ประวัติการเปลี่ยนบริษัท</h2>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">วันที่</th>
                      <th className="px-4 py-3 font-medium">ผู้ใช้</th>
                      <th className="px-4 py-3 font-medium">การกระทำ</th>
                      <th className="px-4 py-3 font-medium">บริษัท</th>
                      <th className="px-4 py-3 font-medium">โดย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500 text-xs">
                          {new Date(log.created_at).toLocaleString("th-TH")}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{log.user_name}</p>
                          <p className="text-xs text-slate-400">{log.user_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            log.action === "add" ? "bg-emerald-100 text-emerald-700"
                            : log.action === "remove" ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                          }`}>
                            {log.action === "add" ? "➕ เพิ่ม" : log.action === "remove" ? "➖ ลบ" : "★ ตั้งหลัก"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{log.company_name}</td>
                        <td className="px-4 py-3 text-slate-700">{log.changed_by_name}</td>
                      </tr>
                    ))}
                    {companyLogs.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">ยังไม่มีประวัติ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
