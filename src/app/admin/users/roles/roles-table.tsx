"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { deletePermissionProfileAction } from "@/server/actions/permission-profile-actions";
import { RoleFormDialog } from "./role-form-dialog";

export type RoleRow = {
  id: string;
  name: string;
  grants: { module: string; action: string }[];
  _count: { users: number };
};

const columns: ColumnDef<RoleRow, unknown>[] = [
  { accessorKey: "name", header: "Role" },
  { id: "grants", header: "Permissions granted", cell: ({ row }) => row.original.grants.length },
  { id: "users", header: "Users assigned", cell: ({ row }) => row.original._count.users },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <RoleFormDialog mode="edit" profile={row.original} />
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" aria-label={`Delete ${row.original.name}`}>
              <Trash2 aria-hidden="true" className="text-danger" />
            </Button>
          }
          title="Delete role"
          description={`Delete "${row.original.name}"? This can't be undone if no users are assigned this role.`}
          confirmLabel="Delete"
          action={deletePermissionProfileAction}
          hiddenFields={{ id: row.original.id }}
        />
      </div>
    ),
  },
];

export function RolesTable({
  rows,
  totalCount,
  params,
}: {
  rows: RoleRow[];
  totalCount: number;
  params: TableParams;
}) {
  return (
    <DataTable
      caption="Roles and permission profiles"
      columns={columns}
      data={rows}
      totalCount={totalCount}
      params={params}
      searchPlaceholder="Search roles…"
      emptyMessage="No custom roles yet. Admins without a role have full access."
      toolbarExtra={<RoleFormDialog mode="create" />}
    />
  );
}
