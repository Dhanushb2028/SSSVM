import Image from "next/image";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { PrintButton } from "./print-button";

export default async function IdCardsPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("sis.id_cards", "VIEW");
  const sp = await searchParams;
  const idsParam = typeof sp.ids === "string" ? sp.ids : "";
  const ids = idsParam.split(",").filter(Boolean);

  const students = await db.student.findMany({
    where: { id: { in: ids } },
    include: { branch: true, section: { include: { course: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print">
        <h1 className="text-xl font-semibold text-foreground">ID Card Preview</h1>
        <p className="text-sm text-muted-foreground">{students.length} card(s) ready to print.</p>
      </div>
      <PrintButton />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2">
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border-2 border-primary bg-surface p-4" style={{ breakInside: "avoid" }}>
            {s.photoUrl ? (
              <Image src={s.photoUrl} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-full bg-gold-soft text-lg font-semibold text-gold-foreground"
              >
                {s.firstName[0]}
                {s.lastName[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sree Siva Shankar Vidya Mandir</p>
              <p className="font-medium text-foreground">
                {s.firstName} {s.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.section ? `${s.section.course.name} - ${s.section.name}` : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Adm. No: {s.admissionNumber}</p>
              <p className="text-xs text-muted-foreground">{s.branch.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
