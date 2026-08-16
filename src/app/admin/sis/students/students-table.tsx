"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import type { TableParams } from "@/lib/data-table/params";

export type StudentRow = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  status: "ACTIVE" | "PROMOTED" | "LEFT";
  branch: { name: string };
  section: { name: string; course: { name: string } } | null;
};

const STATUS_TONE = { ACTIVE: "success", PROMOTED: "neutral", LEFT: "danger" } as const;

const columns: ColumnDef<StudentRow, unknown>[] = [
  { id: "admissionNumber", header: "Admission No.", accessorKey: "admissionNumber" },
  { id: "name", header: "Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
  {
    id: "section",
    header: "Course / Section",
    cell: ({ row }) => (row.original.section ? `${row.original.section.course.name} - ${row.original.section.name}` : "Unassigned"),
  },
  { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge tone={STATUS_TONE[row.original.status]}>{row.original.status}</StatusBadge>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm" aria-label={`View ${row.original.firstName} ${row.original.lastName}`}>
        <Link href={`/admin/sis/students/${row.original.id}`}>
          <Eye aria-hidden="true" />
        </Link>
      </Button>
    ),
  },
];

export function StudentsTable({
  rows,
  totalCount,
  params,
  courses,
  sections,
  courseId,
  sectionId,
}: {
  rows: StudentRow[];
  totalCount: number;
  params: TableParams;
  courses: { id: string; name: string }[];
  sections: { id: string; name: string; course: { name: string } }[];
  courseId?: string;
  sectionId?: string;
}) {
  const exportParams = new URLSearchParams({ q: params.q });
  if (courseId) exportParams.set("courseId", courseId);
  if (sectionId) exportParams.set("sectionId", sectionId);

  return (
    <DataTable
      caption="Students"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/sis/students/export?${exportParams.toString()}`}
      searchPlaceholder="Search by name or admission number…"
      emptyMessage="No students found."
      toolbarExtra={
        <>
          <UrlFilterSelect
            paramKey="courseId"
            placeholder="All courses"
            options={courses.map((c) => ({ value: c.id, label: c.name }))}
          />
          <UrlFilterSelect
            paramKey="sectionId"
            placeholder="All sections"
            options={sections.map((s) => ({ value: s.id, label: `${s.course.name} - ${s.name}` }))}
          />
        </>
      }
    />
  );
}
