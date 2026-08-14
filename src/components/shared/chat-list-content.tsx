import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listChattableStudents } from "@/server/services/chat";
import { getTeacherSectionIds } from "@/lib/rbac/scope";
import { basePathFor } from "@/lib/portal-path";

export async function ChatListContent({ portal }: { portal: "admin" | "teacher" }) {
  const session = await getSession();
  const sectionIds = session?.role === "TEACHER" ? await getTeacherSectionIds(session) : undefined;
  const students = await listChattableStudents(session?.branchId ?? null, sectionIds);
  const base = basePathFor(portal);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Chat</h1>
        <p className="text-sm text-muted-foreground">One thread per student, shared with all of their guardians.</p>
      </div>
      <ul className="flex flex-col gap-1">
        {students.length === 0 && <li className="text-sm text-muted-foreground">No students to chat with yet.</li>}
        {students.map((s) => (
          <li key={s.id}>
            <Link href={`${base}/chat/${s.id}`} className="block rounded-md border border-border p-2 text-sm text-primary hover:underline">
              {s.admissionNumber} — {s.firstName} {s.lastName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
