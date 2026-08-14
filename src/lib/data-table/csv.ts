import "server-only";
import Papa from "papaparse";

/** Builds a downloadable CSV Response for any list/report screen's export action (Section 10). */
export function toCsvResponse(rows: Record<string, unknown>[], filename: string): Response {
  const csv = Papa.unparse(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
