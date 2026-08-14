"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deleteAcademicYearAction } from "@/server/actions/academic-year-actions";
import { AcademicYearFormDialog } from "./academic-year-form-dialog";

export type AcademicYearRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  branchId: string;
  branch: { name: string };
};

function makeColumns(branches: { id: string; name: string }[]): ColumnDef<AcademicYearRow, unknown>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
    {
      id: "range",
      header: "Date range",
      cell: ({ row }) => `${format(row.original.startDate, "d MMM yyyy")} – ${format(row.original.endDate, "d MMM yyyy")}`,
    },
    {
      id: "isCurrent",
      header: "Status",
      cell: ({ row }) =>
        row.original.isCurrent ? (
          <StatusBadge tone="success">Current</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Archived</StatusBadge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <AcademicYearFormDialog mode="edit" branches={branches} year={row.original} />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title="Delete academic year"
            description={`Delete "${row.original.name}"? This can't be undone if it has no sections mapped to it.`}
            confirmLabel="Delete"
            action={deleteAcademicYearAction}
            hiddenFields={{ id: row.original.id }}
          />
        </div>
      ),
    },
  ];
}

export function AcademicYearsTable({
  rows,
  totalCount,
  params,
  branches,
}: {
  rows: AcademicYearRow[];
  totalCount: number;
  params: TableParams;
  branches: { id: string; name: string }[];
}) {
  return (
    <DataTable
      caption="Academic years"
      columns={makeColumns(branches)}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/system-setup/academic-years/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search academic years…"
      emptyMessage="No academic years yet."
      toolbarExtra={<AcademicYearFormDialog mode="create" branches={branches} />}
    />
  );
}
