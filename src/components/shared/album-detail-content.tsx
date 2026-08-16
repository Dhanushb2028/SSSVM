import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { AddGalleryItemForm } from "@/components/shared/add-gallery-item-form";
import { resolveGalleryBranchId } from "@/components/shared/gallery-page-content";

export async function AlbumDetailContent({ id, canManage }: { id: string; canManage: boolean }) {
  const album = await db.galleryAlbum.findUnique({ where: { id }, include: { items: { orderBy: { createdAt: "desc" } } } });
  if (!album) notFound();

  const session = await getSession();
  const branchId = await resolveGalleryBranchId(session);
  if (album.branchId !== branchId) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">{album.title}</h1>
      {canManage && <AddGalleryItemForm albumId={album.id} />}
      {album.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {album.items.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-lg border border-border">
              <Image src={item.imageUrl} alt={item.caption ?? ""} width={300} height={200} className="h-32 w-full object-cover" />
              {item.caption && <figcaption className="p-2 text-xs text-muted-foreground">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
