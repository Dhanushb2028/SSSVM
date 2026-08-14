import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

const DESTINATION_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};

export default async function RootPage() {
  const session = await getSession();
  redirect(session ? DESTINATION_BY_ROLE[session.role] ?? "/login" : "/login");
}
