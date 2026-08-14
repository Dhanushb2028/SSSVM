"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TableParams } from "@/lib/data-table/params";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  totalCount: number;
  params: TableParams;
  exportHref?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  toolbarExtra?: React.ReactNode;
  getRowId?: (row: TData, index: number) => string;
  caption: string;
}

function useUrlTableState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return { update };
}

export function DataTable<TData>({
  columns,
  data,
  totalCount,
  params,
  exportHref,
  searchPlaceholder = "Search…",
  emptyMessage = "No records found.",
  toolbarExtra,
  getRowId,
  caption,
}: DataTableProps<TData>) {
  const { update } = useUrlTableState();
  const [searchDraft, setSearchDraft] = React.useState(params.q);

  React.useEffect(() => {
    setSearchDraft(params.q);
  }, [params.q]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== params.q) update({ q: searchDraft || null, page: "1" });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const pagination: PaginationState = { pageIndex: params.page - 1, pageSize: params.pageSize };
  const sorting: SortingState = params.sort ? [{ id: params.sort, desc: params.dir === "desc" }] : [];
  const pageCount = Math.max(1, Math.ceil(totalCount / params.pageSize));

  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting },
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getRowId: getRowId as ((row: TData) => string) | undefined,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      update({
        sort: first ? first.id : null,
        dir: first ? (first.desc ? "desc" : "asc") : null,
        page: "1",
      });
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      update({ page: String(next.pageIndex + 1), pageSize: String(next.pageSize) });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const from = totalCount === 0 ? 0 : (params.page - 1) * params.pageSize + 1;
  const to = Math.min(totalCount, params.page * params.pageSize);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-64 pl-9"
          />
        </div>
        {toolbarExtra}
        <div className="ml-auto flex items-center gap-2">
          {exportHref && (
            <Button asChild variant="secondary" size="sm">
              <a href={exportHref}>
                <Download aria-hidden="true" />
                Export CSV
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-background">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown aria-hidden="true" className="size-3.5" />
                          ) : (
                            <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground" role="status">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-background">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p aria-live="polite">
          {totalCount === 0 ? "0 results" : `Showing ${from}–${to} of ${totalCount}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => update({ page: String(params.page - 1) })}
            disabled={params.page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" />
            Prev
          </Button>
          <span className={cn("px-1")}>
            Page {params.page} of {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => update({ page: String(params.page + 1) })}
            disabled={params.page >= pageCount}
            aria-label="Next page"
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
