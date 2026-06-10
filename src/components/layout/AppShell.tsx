"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const navItems = [
    { href: "/dashboard",       label: t.dashboard,        icon: "◫",  exact: true },
    { href: "/transactions/add",label: t.addTransactionNav, icon: "＋", exact: true },
    { href: "/transactions",    label: t.transactions,      icon: "≡",  exact: true },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: t.admin, icon: "⚙", exact: false }]
      : []),
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => (
    <Link href={item.href} onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive(item.href, item.exact)
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}>
      <span className="text-base w-5 text-center">{item.icon}</span>
      {item.label}
    </Link>
  );

  const roleBadge: Record<string, string> = {
    admin: "bg-indigo-500",
    user: "bg-emerald-600",
    wait: "bg-amber-500",
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-900 text-white lg:flex fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold shadow-lg shadow-indigo-900/40">
              F
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">FinTrack</p>
              <p className="text-xs text-slate-400">Finance Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="flex rounded-xl overflow-hidden border border-slate-700">
            {(["th", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  lang === l ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}>
                {l === "th" ? "🇹🇭 ไทย" : "🇺🇸 EN"}
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-slate-800 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            {user?.role && (
              <span className={`mt-2 inline-block rounded-full text-xs px-2 py-0.5 text-white ${roleBadge[user.role] ?? "bg-slate-600"}`}>
                {user.role === "admin" ? "Admin" : user.role === "user" ? "User" : "Wait"}
              </span>
            )}
          </div>
          <Button variant="ghost" fullWidth onClick={handleLogout}
            className="!text-slate-300 hover:!bg-slate-800 hover:!text-white rounded-xl">
            {t.signOut}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col">
            <div className="border-b border-slate-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">F</div>
                <div>
                  <p className="text-sm font-bold">FinTrack</p>
                  <p className="text-xs text-slate-400">Finance Manager</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />)}
            </nav>
            <div className="border-t border-slate-800 p-4 space-y-3">
              <div className="rounded-xl bg-slate-800 px-3 py-2.5">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <Button variant="ghost" fullWidth onClick={handleLogout}
                className="!text-slate-300 hover:!bg-slate-800 hover:!text-white rounded-xl">
                {t.signOut}
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <p className="text-sm text-slate-500 hidden lg:block">
                {t.welcomeBack}, <span className="font-medium text-slate-800">{user?.name}</span>
              </p>
              <p className="text-base font-semibold text-slate-900 lg:hidden">FinTrack</p>
            </div>
            {/* Mobile lang toggle */}
            <button onClick={() => setLang(lang === "th" ? "en" : "th")}
              className="lg:hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              {lang === "th" ? "🇺🇸 EN" : "🇹🇭 TH"}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
