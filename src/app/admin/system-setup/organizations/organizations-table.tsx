"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deleteOrganizationAction } from "@/server/actions/organization-actions";
import { OrganizationFormDialog } from "./organization-form-dialog";

export type OrganizationRow = {
  id: string;
  name: string;
  createdAt: Date;
  _count: { branches: number };
};

const columns: ColumnDef<OrganizationRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  {
    id: "branches",
    header: "Branches",
    cell: ({ row }) => row.original._count.branches,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <OrganizationFormDialog mode="edit" organization={row.original} />
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
              <Trash2 aria-hidden="true" className="text-danger" />
            </Button>
          }
          title="Delete organization"
          description={`Delete "${row.original.name}"? This can't be undone if the organization has no branches.`}
          confirmLabel="Delete"
          action={deleteOrganizationAction}
          hiddenFields={{ id: row.original.id }}
        />
      </div>
    ),
  },
];

export function OrganizationsTable({
  rows,
  totalCount,
  params,
}: {
  rows: OrganizationRow[];
  totalCount: number;
  params: TableParams;
}) {
  return (
    <DataTable
      caption="Organizations"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/system-setup/organizations/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search organizations…"
      emptyMessage="No organizations yet."
      toolbarExtra={<OrganizationFormDialog mode="create" />}
    />
  );
}
