"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

function WaitingApprovalPage() {
  const { logout, refreshUser } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Auto-poll every 30 seconds
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          void refreshUser();
          return 30;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [refreshUser]);

  const handleCheck = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
    setCountdown(30);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mx-auto text-4xl">
          ⏳
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "th" ? "รอการอนุมัติ" : "Pending Approval"}
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            {lang === "th"
              ? "บัญชีของคุณยังไม่ได้รับการอนุมัติจาก Admin กรุณารอการติดต่อกลับ"
              : "Your account is pending approval by an Admin. Please wait for confirmation."}
          </p>
          <p className="mt-3 text-xs text-slate-400">
            {lang === "th" ? `ตรวจสอบอัตโนมัติในอีก ${countdown} วินาที` : `Auto-checking in ${countdown}s`}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Button onClick={handleCheck} disabled={checking} className="w-40">
            {checking
              ? (lang === "th" ? "กำลังตรวจสอบ..." : "Checking...")
              : (lang === "th" ? "ตรวจสอบสิทธิ์" : "Check status")}
          </Button>
          <Button variant="secondary" onClick={handleLogout} className="w-40">
            {lang === "th" ? "ออกจากระบบ" : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role === "wait") {
    return <WaitingApprovalPage />;
  }

  return <AppShell>{children}</AppShell>;
}
