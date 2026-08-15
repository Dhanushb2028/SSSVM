"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TableParams } from "@/lib/data-table/params";
import { StaffFormDialog } from "./staff-form-dialog";
import { GenerateLoginDialog } from "./generate-login-dialog";
import { MarkStaffLeftDialog } from "./mark-staff-left-dialog";

export type StaffRow = {
  id: string;
  branchId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string | null;
  employmentType: string;
  qualification: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  joinDate: Date;
  status: string;
  branch: { name: string };
  user: { id: string } | null;
};

function makeColumns(branches: { id: string; name: string }[]): ColumnDef<StaffRow, unknown>[] {
  return [
    { accessorKey: "employeeCode", header: "Code" },
    { id: "name", header: "Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { accessorKey: "designation", header: "Designation" },
    { id: "department", header: "Department", cell: ({ row }) => row.original.department ?? "—" },
    { accessorKey: "phone", header: "Phone" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "ACTIVE" ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Left</StatusBadge>
        ),
    },
    {
      id: "login",
      header: "Login",
      cell: ({ row }) => (row.original.user ? <StatusBadge tone="success">Yes</StatusBadge> : <StatusBadge tone="neutral">None</StatusBadge>),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <StaffFormDialog mode="edit" branches={branches} staff={row.original} />
          {!row.original.user && (
            <GenerateLoginDialog
              staffId={row.original.id}
              suggestedUsername={`${row.original.firstName}.${row.original.lastName}`.toLowerCase().replace(/\s+/g, "")}
            />
          )}
          {row.original.status === "ACTIVE" && (
            <MarkStaffLeftDialog staffId={row.original.id} staffName={`${row.original.firstName} ${row.original.lastName}`} />
          )}
        </div>
      ),
    },
  ];
}

export function StaffTable({
  rows,
  totalCount,
  params,
  branches,
}: {
  rows: StaffRow[];
  totalCount: number;
  params: TableParams;
  branches: { id: string; name: string }[];
}) {
  return (
    <DataTable
      caption="Staff"
      columns={makeColumns(branches)}
      data={rows}
      totalCount={totalCount}
      params={params}
      exportHref={`/admin/hr/staff/export?q=${encodeURIComponent(params.q)}`}
      searchPlaceholder="Search staff…"
      emptyMessage="No staff records yet."
      toolbarExtra={<StaffFormDialog mode="create" branches={branches} />}
    />
  );
}
