"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deleteExamAction } from "@/server/actions/exam-actions";

export type ExamRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  includeInRank: boolean;
  branch: { name: string };
  academicYear: { name: string };
  examType: { name: string };
  subjects: { subject: { name: string } }[];
};

const columns: ColumnDef<ExamRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { id: "type", header: "Type", cell: ({ row }) => row.original.examType.name },
  { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
  { id: "year", header: "Year", cell: ({ row }) => row.original.academicYear.name },
  {
    id: "dates",
    header: "Dates",
    cell: ({ row }) => `${format(row.original.startDate, "d MMM")} – ${format(row.original.endDate, "d MMM yyyy")}`,
  },
  { id: "subjects", header: "Subjects", cell: ({ row }) => row.original.subjects.length },
  {
    id: "rank",
    header: "Rank",
    cell: ({ row }) =>
      row.original.includeInRank ? <StatusBadge tone="success">Included</StatusBadge> : <StatusBadge tone="neutral">Excluded</StatusBadge>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" aria-label={`Edit ${row.original.name}`}>
          <Link href={`/admin/exams/exams/${row.original.id}`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
              <Trash2 aria-hidden="true" className="text-danger" />
            </Button>
          }
          title="Delete exam"
          description={`Delete "${row.original.name}"? This can't be undone if marks have already been entered.`}
          confirmLabel="Delete"
          action={deleteExamAction}
          hiddenFields={{ id: row.original.id }}
        />
      </div>
    ),
  },
];

export function ExamsTable({ rows, totalCount, params }: { rows: ExamRow[]; totalCount: number; params: TableParams }) {
  return (
    <DataTable
      caption="Exams"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      searchPlaceholder="Search exams…"
      emptyMessage="No exams yet."
      toolbarExtra={
        <Button asChild size="sm">
          <Link href="/admin/exams/exams/new">Add Exam</Link>
        </Button>
      }
    />
  );
}
