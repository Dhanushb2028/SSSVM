"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TableParams } from "@/lib/data-table/params";

export type OdRow = {
  id: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_DUTY" | "LEAVE";
  remarks: string | null;
  staffMember: { employeeCode: string; firstName: string; lastName: string };
};

const TONE = { ABSENT: "danger", HALF_DAY: "warning", ON_DUTY: "warning", LEAVE: "warning", PRESENT: "success" } as const;

const columns: ColumnDef<OdRow, unknown>[] = [
  { id: "date", header: "Date", cell: ({ row }) => format(row.original.date, "d MMM yyyy") },
  { id: "employeeCode", header: "Code", cell: ({ row }) => row.original.staffMember.employeeCode },
  { id: "name", header: "Name", cell: ({ row }) => `${row.original.staffMember.firstName} ${row.original.staffMember.lastName}` },
  { id: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
  { id: "remarks", header: "Remarks", cell: ({ row }) => row.original.remarks ?? "—" },
];

export function OdTable({
  rows,
  totalCount,
  params,
  exportQuery,
}: {
  rows: OdRow[];
  totalCount: number;
  params: TableParams;
  exportQuery: string;
}) {
  return (
    <DataTable
      caption="Staff attendance / OD report"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/hr/attendance/reports/export?${exportQuery}`}
      searchPlaceholder="Search staff…"
      emptyMessage="No absences/OD/leave recorded for the selected filters."
    />
  );
}
