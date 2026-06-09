"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPageLink, AuthShell } from "@/components/auth/AuthShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const { user, isLoading, signup, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setIsGoogleLoading(true);

    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to sign up with Google.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const result = await signup(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Unable to create account.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setMessage("Check your email to confirm your account, then sign in.");
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
      title="Create account"
      subtitle="Start tracking your finances"
      footer={
        <>
          Already have an account?{" "}
          <AuthPageLink href="/login">Sign in</AuthPageLink>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleSignInButton
          onClick={() => void handleGoogleSignIn()}
          disabled={isGoogleLoading || isSubmitting}
          label={isGoogleLoading ? "Redirecting..." : "Sign up with Google"}
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
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            required
            minLength={6}
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
