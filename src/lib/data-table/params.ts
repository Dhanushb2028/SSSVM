export type TableParams = {
  page: number;
  pageSize: number;
  q: string;
  sort: string | null;
  dir: "asc" | "desc";
};

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

/** Parses table state (page/pageSize/sort/dir/q) out of a Next.js searchParams object, server-side. */
export function parseTableParams(
  searchParams: Record<string, string | string[] | undefined>,
  defaults?: Partial<Pick<TableParams, "pageSize" | "sort" | "dir">>,
): TableParams {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const toFiniteNumber = (value: string | undefined): number | null => {
    if (value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const page = Math.max(1, toFiniteNumber(get("page")) ?? 1);
  const pageSizeRaw = toFiniteNumber(get("pageSize")) ?? defaults?.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw));
  const q = get("q") ?? "";
  const sort = get("sort") ?? defaults?.sort ?? null;
  const dir = get("dir") === "desc" ? "desc" : get("dir") === "asc" ? "asc" : defaults?.dir ?? "asc";

  return { page, pageSize, q, sort, dir };
}

export function toPrismaSkipTake(params: TableParams) {
  return { skip: (params.page - 1) * params.pageSize, take: params.pageSize };
}
