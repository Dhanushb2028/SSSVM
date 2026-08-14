import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

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
    <main id="main-content" className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground ring-4 ring-gold-soft"
          >
            SS
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Sree Siva Shankar Vidya Mandir</h1>
            <p className="text-sm text-muted-foreground">K.R.M. Colony</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
