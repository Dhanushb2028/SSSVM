import Link from "next/link";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteAlbumAction } from "@/server/actions/gallery-actions";
import { AlbumFormDialog } from "@/components/shared/album-form-dialog";
import { basePathFor } from "@/lib/portal-path";

async function resolveBranchId(session: NonNullable<Awaited<ReturnType<typeof getSession>>> | null): Promise<string | null> {
  if (!session) return null;
  if (session.role === "ADMIN") {
    if (session.branchId) return session.branchId;
    const first = await db.branch.findFirst({ where: { deletedAt: null }, orderBy: { name: "asc" } });
    return first?.id ?? null;
  }
  if (session.role === "TEACHER" && session.staffMemberId) {
    const staff = await db.staffMember.findUnique({ where: { id: session.staffMemberId }, select: { branchId: true } });
    return staff?.branchId ?? null;
  }
  if (session.role === "STUDENT" && session.studentId) {
    const student = await db.student.findUnique({ where: { id: session.studentId }, select: { branchId: true } });
    return student?.branchId ?? null;
  }
  if (session.role === "PARENT" && session.guardianId) {
    const link = await db.studentGuardian.findFirst({ where: { guardianId: session.guardianId }, include: { student: true } });
    return link?.student.branchId ?? null;
  }
  return null;
}

export async function GalleryPageContent({ portal }: { portal: "admin" | "teacher" | "student" | "parent" }) {
  const session = await getSession();
  const branchId = await resolveBranchId(session);
  const canManage = portal === "admin" || portal === "teacher";
  const albums = branchId
    ? await db.galleryAlbum.findMany({ where: { branchId }, include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" } })
    : [];
  const base = basePathFor(portal);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground">Gallery</h1>
        {canManage && branchId && <AlbumFormDialog branchId={branchId} />}
      </div>
      {albums.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-8" />
            <p>No albums yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {albums.map((a) => (
            <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <Link href={`${base}/gallery/${a.id}`} className="text-sm font-medium text-primary hover:underline">
                {a.title}
              </Link>
              <p className="text-xs text-muted-foreground">{a._count.items} photo(s)</p>
              {canManage && (
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="sm" className="w-fit" aria-label={`Delete ${a.title}`}>
                      <Trash2 aria-hidden="true" className="text-danger" />
                    </Button>
                  }
                  title="Delete album"
                  description={`Delete "${a.title}" and all its photos?`}
                  confirmLabel="Delete"
                  action={deleteAlbumAction}
                  hiddenFields={{ id: a.id }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
