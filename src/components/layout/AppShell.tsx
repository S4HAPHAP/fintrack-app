"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const navItems = [
    { href: "/dashboard", label: t.dashboard, icon: "◫" },
    { href: "/transactions/add", label: t.addTransactionNav, icon: "＋" },
    { href: "/transactions", label: t.transactions, icon: "≡" },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: t.admin, icon: "⚙" }]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-900 text-white lg:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold">
              F
            </div>
            <div>
              <p className="text-sm font-semibold">FinTrack</p>
              <p className="text-xs text-slate-400">Finance Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-3">
          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(["th", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  lang === l
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {l === "th" ? "🇹🇭 ไทย" : "🇺🇸 EN"}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-slate-800 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="mt-1 inline-block rounded text-xs bg-indigo-500 px-1.5 py-0.5">
                Admin
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            className="!text-slate-300 hover:!bg-slate-800 hover:!text-white"
          >
            {t.signOut}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <p className="text-lg font-semibold text-slate-900">FinTrack</p>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 lg:justify-between">
              <p className="hidden text-sm text-slate-500 lg:block">
                {t.welcomeBack}, {user?.name}
              </p>
              <div className="flex gap-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      pathname === item.href
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {/* Mobile lang toggle */}
                <button
                  onClick={() => setLang(lang === "th" ? "en" : "th")}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                >
                  {lang === "th" ? "EN" : "TH"}
                </button>
                <Button variant="secondary" onClick={handleLogout}>
                  {t.signOut}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
