import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { BannerFormDialog } from "./banner-form-dialog";
import { BannerCard } from "./banner-card";

export default async function BannersPage() {
  const session = await requirePermissionOrRedirect("sis.app_banners", "VIEW");
  const [banners, branches] = await Promise.all([
    db.appBanner.findMany({
      where: { ...(session.branchId ? { branchId: session.branchId } : {}) },
      include: { branch: true },
      orderBy: { orderIndex: "asc" },
    }),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">App Home Banners</h1>
          <p className="text-sm text-muted-foreground">Image sliders shown on the Student/Parent portal home screen.</p>
        </div>
        <BannerFormDialog branches={branches} />
      </div>
      {banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No banners yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </div>
      )}
    </div>
  );
}
