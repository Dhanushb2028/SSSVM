import { notFound } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { requirePermissionOrRedirect, hasPermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { getStudentDetail, listStudentFilterData } from "@/server/services/students";
import { db } from "@/lib/db";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { trashStudentAction } from "@/server/actions/student-actions";
import { StudentForm } from "../student-form";
import { GuardiansSection } from "./guardians-section";
import { MarkLeftDialog } from "./mark-left-dialog";
import { TransportSection, HostelSection } from "./transport-hostel-section";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("sis.students", "VIEW");
  const { id } = await params;
  const student = await getStudentDetail(id);
  if (!student) notFound();
  assertBranchAccess(session, student.branchId);

  const filterData = await listStudentFilterData(session.branchId);
  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {student.photoUrl ? (
            <Image
              src={student.photoUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-gold-soft text-lg font-semibold text-gold-foreground"
            >
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.admissionNumber} ·{" "}
              {student.section ? `${student.section.course.name} - ${student.section.name}` : "Unassigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {student.status !== "LEFT" && hasPermission(session, "sis.outgoing", "EDIT") && (
            <MarkLeftDialog studentId={student.id} studentName={`${student.firstName} ${student.lastName}`} />
          )}
          {hasPermission(session, "sis.trash", "DELETE") && (
            <ConfirmDialog
              trigger={
                <Button variant="secondary" size="sm">
                  <Trash2 aria-hidden="true" className="text-danger" />
                  Move to Trash
                </Button>
              }
              title="Move student to trash"
              description={`Move ${student.firstName} ${student.lastName} to trash? They can be restored later from the Trash screen.`}
              confirmLabel="Move to Trash"
              action={trashStudentAction}
              hiddenFields={{ id: student.id }}
            />
          )}
        </div>
      </div>

      <StudentForm
        mode="edit"
        branches={filterData.branches}
        sections={sections}
        student={{ ...student, gender: student.gender }}
      />

      <GuardiansSection
        studentId={student.id}
        links={student.guardians.map((g) => ({
          guardian: g.guardian,
          relationship: g.relationship,
          isPrimary: g.isPrimary,
        }))}
      />

      {hasPermission(session, "transport.routes", "EDIT") && (
        <TransportSection
          studentId={student.id}
          routeStopId={student.routeStopId}
          routeStops={await db.routeStop.findMany({
            where: { route: { branchId: student.branchId, deletedAt: null } },
            include: { route: true },
            orderBy: { sequence: "asc" },
          })}
        />
      )}

      {hasPermission(session, "hostel.manage", "EDIT") && (
        <HostelSection
          studentId={student.id}
          hostelRoomId={student.hostelRoomId}
          hostelRooms={await db.hostelRoom.findMany({
            where: { hostel: { branchId: student.branchId, deletedAt: null } },
            include: { hostel: true },
            orderBy: { roomNumber: "asc" },
          })}
        />
      )}
    </div>
  );
}
