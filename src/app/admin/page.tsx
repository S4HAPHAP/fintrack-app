"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  const { t } = useLanguage();

  const sections = [
    { href: "/admin/users", label: t.users, icon: "👥", desc: t.users },
    { href: "/admin/companies", label: t.companies, icon: "🏢", desc: t.companies },
    { href: "/admin/categories", label: t.categories, icon: "🏷️", desc: t.categories },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t.adminPanel}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="font-semibold text-slate-900">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
