"use client";

import { AuthProvider } from "@/context/AuthContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { LanguageProvider } from "@/context/LanguageContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FinanceProvider>{children}</FinanceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
