import { Trash2, Video as VideoIcon } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteVideoAction } from "@/server/actions/gallery-actions";
import { VideoFormDialog } from "@/components/shared/video-form-dialog";

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

export async function VideosPageContent({ portal }: { portal: "admin" | "teacher" | "student" | "parent" }) {
  const session = await getSession();
  const branchId = await resolveBranchId(session);
  const canManage = portal === "admin" || portal === "teacher";
  const videos = branchId ? await db.video.findMany({ where: { branchId }, orderBy: { createdAt: "desc" } }) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground">Videos</h1>
        {canManage && branchId && <VideoFormDialog branchId={branchId} />}
      </div>
      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <VideoIcon aria-hidden="true" className="size-8" />
            <p>No videos yet.</p>
          </CardContent>
        </Card>
      ) : (
        videos.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex items-start justify-between gap-2 pt-6 text-sm">
              <div>
                <a href={v.videoUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                  {v.title}
                </a>
                {v.description && <p className="text-muted-foreground">{v.description}</p>}
              </div>
              {canManage && (
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="sm" aria-label={`Delete ${v.title}`}>
                      <Trash2 aria-hidden="true" className="text-danger" />
                    </Button>
                  }
                  title="Delete video"
                  description={`Delete "${v.title}"?`}
                  confirmLabel="Delete"
                  action={deleteVideoAction}
                  hiddenFields={{ id: v.id }}
                />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
