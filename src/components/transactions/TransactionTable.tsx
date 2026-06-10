"use client";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";
import type { Transaction } from "@/types";

function exportCSV(transactions: Transaction[]) {
  const headers = ["วันที่","ประเภท","หมวดหมู่","บริษัท","โปรเจค","หมายเหตุ","จำนวน","ผู้สร้าง","วันที่สร้าง"];
  const rows = transactions.map((tx) => [
    tx.date, tx.type === "income" ? "รายรับ" : "รายจ่าย",
    tx.category, tx.companyName ?? "", tx.projectName, tx.note ?? "",
    tx.type === "income" ? tx.amount : -tx.amount,
    tx.createdBy ?? "", tx.createdAt ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `fintrack-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const PAGE_SIZE = 15;

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = transactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((tx) =>
        tx.category.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q) ||
        tx.projectName?.toLowerCase().includes(q) ||
        tx.companyName?.toLowerCase().includes(q) ||
        tx.createdBy?.toLowerCase().includes(q)
      );
    }
    if (dateFrom) result = result.filter((tx) => tx.date >= dateFrom);
    if (dateTo)   result = result.filter((tx) => tx.date <= dateTo);
    return result;
  }, [transactions, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFrom = (v: string) => { setDateFrom(v); setPage(1); };
  const handleTo = (v: string) => { setDateTo(v); setPage(1); };

  return (
    <Card className="overflow-hidden p-0">
      {/* Header + Filters */}
      <div className="border-b border-slate-200 px-6 py-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t.transactionList}</h2>
            <p className="text-sm text-slate-500">{filtered.length} รายการ {filtered.length !== transactions.length && `(กรองจาก ${transactions.length})`}</p>
          </div>
          <button onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            ⬇ Export CSV
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="ค้นหา หมวดหมู่ โปรเจค หมายเหตุ..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          {/* Date range */}
          <input type="date" value={dateFrom} onChange={(e) => handleFrom(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="flex items-center text-slate-400 text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => handleTo(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {(search || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
              ✕ ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-sm font-medium text-slate-600">ไม่พบรายการที่ค้นหา</p>
          <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหาหรือวันที่</p>
        </div>
      ) : (
        <>
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
                  <th className="px-6 py-3 font-medium">{t.createdByCol}</th>
                  <th className="px-6 py-3 font-medium">{t.createdAtCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700">{formatDate(tx.date)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {tx.type === "income" ? t.income : t.expense}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{tx.category}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">{tx.companyName ?? "—"}</td>
                    <td className="px-6 py-3.5 text-slate-700">{tx.projectName}</td>
                    <td className="max-w-[200px] truncate px-6 py-3.5 text-slate-500">{tx.note || "—"}</td>
                    <td className={`whitespace-nowrap px-6 py-3.5 text-right font-semibold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-600">{tx.createdBy ?? "—"}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500">{tx.createdAt ? formatDateTime(tx.createdAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
              <p className="text-xs text-slate-500">
                แสดง {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={currentPage === 1}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-40">«</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-40">‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const p = start + i;
                  return p <= totalPages ? (
                    <button key={p} onClick={() => setPage(p)}
                      className={`rounded px-2.5 py-1 text-xs font-medium ${p === currentPage ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                      {p}
                    </button>
                  ) : null;
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-40">›</button>
                <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-40">»</button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
