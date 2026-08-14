"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";

export type OutgoingRow = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  leftDate: Date | null;
  leftReason: string | null;
  branch: { name: string };
  section: { name: string; course: { name: string } } | null;
};

const columns: ColumnDef<OutgoingRow, unknown>[] = [
  { id: "admissionNumber", header: "Admission No.", accessorKey: "admissionNumber" },
  { id: "name", header: "Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
  {
    id: "section",
    header: "Last Section",
    cell: ({ row }) => (row.original.section ? `${row.original.section.course.name} - ${row.original.section.name}` : "—"),
  },
  { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
  {
    id: "leftDate",
    header: "Left On",
    cell: ({ row }) => (row.original.leftDate ? format(row.original.leftDate, "d MMM yyyy") : "—"),
  },
  { id: "leftReason", header: "Reason", cell: ({ row }) => row.original.leftReason ?? "—" },
  {
    id: "dues",
    header: "Outstanding Dues",
    cell: () => <span className="text-muted-foreground">Pending Finance module</span>,
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

export function OutgoingTable({ rows, totalCount, params }: { rows: OutgoingRow[]; totalCount: number; params: TableParams }) {
  return (
    <DataTable
      caption="Outgoing students"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/sis/outgoing/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search outgoing students…"
      emptyMessage="No students have left yet."
    />
  );
}
