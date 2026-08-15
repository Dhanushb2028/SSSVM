"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import type { TableParams } from "@/lib/data-table/params";
import { IssueTcDialog } from "./issue-tc-dialog";

export type TcRow = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  tcNumber: string | null;
  tcIssuedDate: Date | null;
  branch: { name: string };
  section: { name: string; course: { name: string } } | null;
};

function makeColumns(issued: boolean): ColumnDef<TcRow, unknown>[] {
  const cols: ColumnDef<TcRow, unknown>[] = [
    { id: "admissionNumber", header: "Admission No.", accessorKey: "admissionNumber" },
    { id: "name", header: "Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    {
      id: "section",
      header: "Course / Section",
      cell: ({ row }) => (row.original.section ? `${row.original.section.course.name} - ${row.original.section.name}` : "—"),
    },
    { id: "branch", header: "Branch", cell: ({ row }) => row.original.branch.name },
  ];
  if (issued) {
    cols.push(
      { id: "tcNumber", header: "TC Number", cell: ({ row }) => row.original.tcNumber ?? "—" },
      { id: "tcDate", header: "Issued On", cell: ({ row }) => (row.original.tcIssuedDate ? format(row.original.tcIssuedDate, "d MMM yyyy") : "—") },
    );
  } else {
    cols.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <IssueTcDialog studentId={row.original.id} studentName={`${row.original.firstName} ${row.original.lastName}`} />,
    });
  }
  return cols;
}

export function TcTable({
  rows,
  totalCount,
  params,
  issued,
  courses,
}: {
  rows: TcRow[];
  totalCount: number;
  params: TableParams;
  issued: boolean;
  courses: { id: string; name: string }[];
}) {
  return (
    <DataTable
      caption={issued ? "TC issued students" : "TC eligible, not yet issued"}
      columns={makeColumns(issued)}
      data={rows}
      totalCount={totalCount}
      params={params}
      searchPlaceholder="Search by name or admission number…"
      emptyMessage={issued ? "No TCs issued yet." : "No students eligible and pending TC issuance."}
      toolbarExtra={<UrlFilterSelect paramKey="courseId" placeholder="All courses" options={courses.map((c) => ({ value: c.id, label: c.name }))} />}
    />
  );
}
