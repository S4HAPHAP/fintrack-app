"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPageLink, AuthShell } from "@/components/auth/AuthShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { user, isLoading, login, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to sign in with Google.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Invalid email or password.");
      return;
    }

    router.replace("/dashboard");
  };

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in to manage your finances"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <AuthPageLink href="/signup">Create one</AuthPageLink>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleSignInButton
          onClick={() => void handleGoogleSignIn()}
          disabled={isGoogleLoading || isSubmitting}
          label={isGoogleLoading ? "Redirecting..." : "Continue with Google"}
        />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
