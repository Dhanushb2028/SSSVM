import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdvanceStageButton, MarkLostButton } from "@/app/admin/admissions/enquiries/enquiry-card-actions";
import { ConvertEnquiryDialog } from "@/app/admin/admissions/enquiries/convert-enquiry-dialog";

const STAGE_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISITED: "Visited",
  APPLIED: "Applied",
  ADMITTED: "Admitted",
  LOST: "Lost",
};

const NEXT_LABEL: Record<string, string> = {
  NEW: "Mark Contacted",
  CONTACTED: "Mark Visited",
  VISITED: "Mark Applied",
};

export async function EnquiryBoard({ branchId, columns }: { branchId: string; columns: string[] }) {
  const [enquiries, sections] = await Promise.all([
    db.admissionEnquiry.findMany({ where: { branchId, status: { in: columns as never[] } }, orderBy: { updatedAt: "desc" } }),
    db.section.findMany({ where: { deletedAt: null, branchId }, include: { course: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((col) => {
        const items = enquiries.filter((e) => e.status === col);
        return (
          <div key={col} className="flex w-72 shrink-0 flex-col gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {STAGE_LABEL[col]} <span className="text-muted-foreground">({items.length})</span>
            </h2>
            <div className="flex flex-col gap-2">
              {items.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
              {items.map((e) => (
                <div key={e.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 text-sm">
                  <p className="font-medium text-foreground">{e.studentName}</p>
                  <p className="text-muted-foreground">{e.parentName} · {e.phone}</p>
                  {e.visitCount > 0 && <StatusBadge tone="neutral">{e.visitCount} visit(s)</StatusBadge>}
                  <div className="flex flex-wrap items-center gap-1">
                    {NEXT_LABEL[e.status] && <AdvanceStageButton id={e.id} label={NEXT_LABEL[e.status]} />}
                    {e.status === "APPLIED" && (
                      <ConvertEnquiryDialog enquiryId={e.id} studentName={e.studentName} sections={sections} />
                    )}
                    {e.status !== "ADMITTED" && e.status !== "LOST" && <MarkLostButton id={e.id} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
