import { redirect } from "next/navigation";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const DESTINATION_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(DESTINATION_BY_ROLE[session.role] ?? "/login");

  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col md:flex-row">
      <div
        className="relative flex flex-col justify-between gap-10 overflow-hidden px-8 py-12 text-white md:w-1/2 md:px-16 md:py-16"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold-strong/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-0 size-80 rounded-full bg-primary-soft/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-gold-strong text-lg font-bold text-gold-foreground ring-4 ring-gold-strong/30"
          >
            SS
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-strong/90">SSSVM Portal</p>
            <p className="text-xs text-white/70">K.R.M. Colony</p>
          </div>
        </div>

        <div className="relative flex flex-col gap-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Sree Siva Shankar
            <br />
            Vidya Mandir
          </h1>
          <p className="max-w-sm text-sm text-white/80">
            One portal for admins, teachers, students, and parents — attendance, homework, results, fees, and
            messages, all in one place.
          </p>
          <ul className="flex flex-col gap-3 text-sm text-white/85">
            <li className="flex items-center gap-2.5">
              <GraduationCap aria-hidden="true" className="size-5 shrink-0 text-gold-strong" />
              Built for every role in the school
            </li>
            <li className="flex items-center gap-2.5">
              <Sparkles aria-hidden="true" className="size-5 shrink-0 text-gold-strong" />
              Real-time messages, homework and results
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck aria-hidden="true" className="size-5 shrink-0 text-gold-strong" />
              Secure, role-based access
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/60">&copy; {new Date().getFullYear()} SSSVM. All rights reserved.</p>
      </div>

      <div className="bg-app-gradient relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle surface="canvas" />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1 text-center md:hidden">
            <h2 className="text-lg font-semibold text-[var(--on-canvas)]">Sree Siva Shankar Vidya Mandir</h2>
            <p className="text-sm text-[var(--on-canvas-muted)]">K.R.M. Colony</p>
          </div>
          <div className="mb-6 hidden flex-col gap-1 md:flex">
            <h2 className="text-xl font-semibold text-[var(--on-canvas)]">Sign in</h2>
            <p className="text-sm text-[var(--on-canvas-muted)]">Enter your credentials to access your portal.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
