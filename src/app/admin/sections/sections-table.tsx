"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deleteSectionAction } from "@/server/actions/section-actions";
import { SectionFormDialog } from "./section-form-dialog";

export type SectionRow = {
  id: string;
  name: string;
  capacity: number | null;
  branchId: string;
  courseId: string;
  academicYearId: string;
  classTeacherId: string | null;
  branch: { name: string };
  course: { name: string };
  academicYear: { name: string };
  classTeacher: { firstName: string; lastName: string } | null;
  _count: { students: number };
};

type PickerData = {
  branches: { id: string; name: string }[];
  courses: { id: string; name: string }[];
  academicYears: { id: string; name: string; branchId: string }[];
  teachers: { id: string; firstName: string; lastName: string; branchId: string }[];
};

function makeColumns(picker: PickerData): ColumnDef<SectionRow, unknown>[] {
  return [
    { id: "course", header: "Course", cell: ({ row }) => `${row.original.course.name} - ${row.original.name}` },
    { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
    { id: "year", header: "Academic Year", cell: ({ row }) => row.original.academicYear.name },
    {
      id: "teacher",
      header: "Class Teacher",
      cell: ({ row }) =>
        row.original.classTeacher
          ? `${row.original.classTeacher.firstName} ${row.original.classTeacher.lastName}`
          : "Unassigned",
    },
    {
      id: "strength",
      header: "Strength",
      cell: ({ row }) => `${row.original._count.students}${row.original.capacity ? ` / ${row.original.capacity}` : ""}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <SectionFormDialog mode="edit" picker={picker} section={row.original} />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title="Delete section"
            description={`Delete "${row.original.course.name} - ${row.original.name}"? This can't be undone if the section has no students.`}
            confirmLabel="Delete"
            action={deleteSectionAction}
            hiddenFields={{ id: row.original.id }}
          />
        </div>
      ),
    },
  ];
}

export function SectionsTable({
  rows,
  totalCount,
  params,
  picker,
}: {
  rows: SectionRow[];
  totalCount: number;
  params: TableParams;
  picker: PickerData;
}) {
  return (
    <DataTable
      caption="Sections"
      columns={makeColumns(picker)}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/sections/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search sections…"
      emptyMessage="No sections yet."
      toolbarExtra={<SectionFormDialog mode="create" picker={picker} />}
    />
  );
}
