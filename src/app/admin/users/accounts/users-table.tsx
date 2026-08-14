"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PowerOff, Power } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import type { TableParams } from "@/lib/data-table/params";
import { toggleUserActiveAction } from "@/server/actions/user-actions";
import { UserFormDialog } from "./user-form-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

export type UserRow = {
  id: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  username: string | null;
  mobile: string | null;
  name: string | null;
  email: string | null;
  isActive: boolean;
  branchId: string | null;
  permissionProfileId: string | null;
  branch: { name: string } | null;
  permissionProfile: { name: string } | null;
  lastLoginAt: Date | null;
};

const ROLE_LABEL: Record<UserRow["role"], string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};

function makeColumns(
  branches: { id: string; name: string }[],
  profiles: { id: string; name: string }[],
  currentUserId: string,
): ColumnDef<UserRow, unknown>[] {
  return [
    { id: "name", header: "Name", cell: ({ row }) => row.original.name ?? "—" },
    { id: "identifier", header: "Login", cell: ({ row }) => row.original.username ?? row.original.mobile ?? "—" },
    { id: "role", header: "Role", cell: ({ row }) => ROLE_LABEL[row.original.role] },
    {
      id: "scope",
      header: "Branch / Role profile",
      cell: ({ row }) =>
        `${row.original.branch?.name ?? "All branches"} · ${row.original.permissionProfile?.name ?? "Full access"}`,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="danger">Deactivated</StatusBadge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isSelf = row.original.id === currentUserId;
        return (
          <div className="flex items-center gap-1">
            {row.original.role === "ADMIN" && (
              <UserFormDialog mode="edit" branches={branches} profiles={profiles} user={row.original} />
            )}
            <ResetPasswordDialog userId={row.original.id} userName={row.original.name ?? "this user"} />
            {!isSelf && (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={row.original.isActive ? `Deactivate ${row.original.name}` : `Activate ${row.original.name}`}
                  >
                    {row.original.isActive ? (
                      <PowerOff aria-hidden="true" className="text-danger" />
                    ) : (
                      <Power aria-hidden="true" className="text-success" />
                    )}
                  </Button>
                }
                title={row.original.isActive ? "Deactivate account" : "Activate account"}
                description={
                  row.original.isActive
                    ? `Deactivate ${row.original.name}? They'll be signed out immediately and can't log in until reactivated.`
                    : `Reactivate ${row.original.name}? They'll be able to log in again.`
                }
                confirmLabel={row.original.isActive ? "Deactivate" : "Activate"}
                variant={row.original.isActive ? "danger" : "primary"}
                action={toggleUserActiveAction}
                hiddenFields={{ id: row.original.id }}
              />
            )}
          </div>
        );
      },
    },
  ];
}

export function UsersTable({
  rows,
  totalCount,
  params,
  branches,
  profiles,
  currentUserId,
}: {
  rows: UserRow[];
  totalCount: number;
  params: TableParams;
  branches: { id: string; name: string }[];
  profiles: { id: string; name: string }[];
  currentUserId: string;
}) {
  return (
    <DataTable
      caption="User accounts"
      columns={makeColumns(branches, profiles, currentUserId)}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/users/accounts/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search by name, username, or email…"
      emptyMessage="No users yet."
      toolbarExtra={<UserFormDialog mode="create" branches={branches} profiles={profiles} />}
    />
  );
}
