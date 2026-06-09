import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-2xl font-bold text-white shadow-lg">
            F
          </div>
          <h1 className="text-2xl font-bold text-white">FinTrack</h1>
          <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
        </div>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2>
          {children}
        </Card>

        <p className="mt-4 text-center text-sm text-slate-300">{footer}</p>
      </div>
    </div>
  );
}

export function AuthPageLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-indigo-300 underline-offset-4 hover:text-white hover:underline"
    >
      {children}
    </Link>
  );
}
