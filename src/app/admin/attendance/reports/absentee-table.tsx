"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TableParams } from "@/lib/data-table/params";

export type AbsenteeRow = {
  id: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  student: { admissionNumber: string; firstName: string; lastName: string };
  section: { name: string; course: { name: string }; branch: { name: string } };
};

const TONE = { ABSENT: "danger", LATE: "warning", HALF_DAY: "warning", PRESENT: "success" } as const;

const columns: ColumnDef<AbsenteeRow, unknown>[] = [
  { id: "date", header: "Date", cell: ({ row }) => format(row.original.date, "d MMM yyyy") },
  { id: "admissionNumber", header: "Admission No.", cell: ({ row }) => row.original.student.admissionNumber },
  { id: "name", header: "Name", cell: ({ row }) => `${row.original.student.firstName} ${row.original.student.lastName}` },
  { id: "section", header: "Section", cell: ({ row }) => `${row.original.section.course.name} - ${row.original.section.name}` },
  { id: "branch", header: "Branch", cell: ({ row }) => row.original.section.branch.name },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge>,
  },
];

export function AbsenteeTable({
  rows,
  totalCount,
  params,
  exportQuery,
}: {
  rows: AbsenteeRow[];
  totalCount: number;
  params: TableParams;
  exportQuery: string;
}) {
  return (
    <DataTable
      caption="Absentee report"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/attendance/reports/export?${exportQuery}`}
      searchPlaceholder="Search…"
      emptyMessage="No absences recorded for the selected filters."
    />
  );
}
