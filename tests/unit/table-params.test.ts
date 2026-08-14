import { describe, it, expect } from "vitest";
import { parseTableParams, toPrismaSkipTake } from "@/lib/data-table/params";

describe("parseTableParams", () => {
  it("defaults to page 1 and the given default page size/sort", () => {
    const params = parseTableParams({}, { pageSize: 25, sort: "name", dir: "asc" });
    expect(params).toEqual({ page: 1, pageSize: 25, q: "", sort: "name", dir: "asc" });
  });

  it("parses page/pageSize/sort/dir/q from string search params", () => {
    const params = parseTableParams({ page: "3", pageSize: "10", sort: "createdAt", dir: "desc", q: "reddy" });
    expect(params).toEqual({ page: 3, pageSize: 10, q: "reddy", sort: "createdAt", dir: "desc" });
  });

  it("clamps page below 1 up to 1", () => {
    expect(parseTableParams({ page: "-5" }).page).toBe(1);
    expect(parseTableParams({ page: "abc" }).page).toBe(1);
  });

  it("clamps pageSize to the [1, 200] range", () => {
    expect(parseTableParams({ pageSize: "0" }).pageSize).toBe(1);
    expect(parseTableParams({ pageSize: "999999" }).pageSize).toBe(200);
  });

  it("takes only the first value when a param is an array", () => {
    const params = parseTableParams({ sort: ["createdAt", "name"] });
    expect(params.sort).toBe("createdAt");
  });
});

describe("toPrismaSkipTake", () => {
  it("computes skip/take for page 1", () => {
    expect(toPrismaSkipTake({ page: 1, pageSize: 25, q: "", sort: null, dir: "asc" })).toEqual({ skip: 0, take: 25 });
  });

  it("computes skip/take for a later page", () => {
    expect(toPrismaSkipTake({ page: 3, pageSize: 10, q: "", sort: null, dir: "asc" })).toEqual({ skip: 20, take: 10 });
  });
});
