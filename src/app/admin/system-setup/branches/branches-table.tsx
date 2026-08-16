"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deleteBranchAction } from "@/server/actions/branch-actions";
import { BranchFormDialog } from "./branch-form-dialog";

export type BranchRow = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  organizationId: string;
  organization: { name: string };
};

function makeColumns(organizations: { id: string; name: string }[]): ColumnDef<BranchRow, unknown>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { id: "organization", header: "Organization", cell: ({ row }) => row.original.organization.name },
    { accessorKey: "city", header: "City", cell: ({ row }) => row.original.city ?? "—" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BranchFormDialog mode="edit" organizations={organizations} branch={row.original} />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title="Delete branch"
            description={`Delete "${row.original.name}"? This can't be undone if the branch has no sections, students, or academic years.`}
            confirmLabel="Delete"
            action={deleteBranchAction}
            hiddenFields={{ id: row.original.id }}
          />
        </div>
      ),
    },
  ];
}

export function BranchesTable({
  rows,
  totalCount,
  params,
  organizations,
}: {
  rows: BranchRow[];
  totalCount: number;
  params: TableParams;
  organizations: { id: string; name: string }[];
}) {
  return (
    <DataTable
      caption="Branches"
      columns={makeColumns(organizations)}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/system-setup/branches/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search branches…"
      emptyMessage="No branches yet."
      toolbarExtra={<BranchFormDialog mode="create" organizations={organizations} />}
    />
  );
}
