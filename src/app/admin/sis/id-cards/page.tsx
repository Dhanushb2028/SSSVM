import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { SectionPickerSelect } from "../_shared/section-picker-select";
import { IdCardSelector } from "./id-card-selector";

export default async function IdCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.id_cards", "VIEW");
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true, branch: true },
    orderBy: { name: "asc" },
  });

  const students = sectionId
    ? await db.student.findMany({ where: { sectionId, status: "ACTIVE", deletedAt: null }, orderBy: { firstName: "asc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">ID Cards</h1>
        <p className="text-sm text-muted-foreground">Select students to generate printable ID cards.</p>
      </div>
      <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
      <IdCardSelector students={students} />
    </div>
  );
}
