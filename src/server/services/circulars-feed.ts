import "server-only";
import { db } from "@/lib/db";

export async function getCircularsForStudent(branchId: string, sectionId: string | null) {
  return db.circular.findMany({
    where: {
      branchId,
      OR: [{ sectionId: null }, ...(sectionId ? [{ sectionId }] : [])],
    },
    orderBy: { createdAt: "desc" },
  });
}
