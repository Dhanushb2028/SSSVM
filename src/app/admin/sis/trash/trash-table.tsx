"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArchiveRestore } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { restoreStudentAction } from "@/server/actions/student-actions";

export type TrashRow = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
  branch: { name: string };
  section: { name: string; course: { name: string } } | null;
};

const columns: ColumnDef<TrashRow, unknown>[] = [
  { id: "admissionNumber", header: "Admission No.", accessorKey: "admissionNumber" },
  { id: "name", header: "Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
  { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ConfirmDialog
        trigger={
          <Button variant="secondary" size="sm">
            <ArchiveRestore aria-hidden="true" />
            Restore
          </Button>
        }
        title="Restore student"
        description={`Restore ${row.original.firstName} ${row.original.lastName} from trash?`}
        confirmLabel="Restore"
        variant="primary"
        action={restoreStudentAction}
        hiddenFields={{ id: row.original.id }}
      />
    ),
  },
];

export function TrashTable({ rows, totalCount, params }: { rows: TrashRow[]; totalCount: number; params: TableParams }) {
  return (
    <DataTable
      caption="Trashed students"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      searchPlaceholder="Search trashed students…"
      emptyMessage="Trash is empty."
    />
  );
}
