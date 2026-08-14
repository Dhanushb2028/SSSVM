import "server-only";
import { db } from "@/lib/db";

/**
 * Records who did what, when, to which record — required for every
 * destructive/financial action (Section 9): fee cancellations, bank
 * transaction cancellations, bulk promotions, certificate-eligibility
 * changes, bulk SMS sends.
 */
export async function recordAudit(params: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      metadata: params.metadata as never,
    },
  });
}
