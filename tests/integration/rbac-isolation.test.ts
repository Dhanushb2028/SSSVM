import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { assertOwnStudent, assertBranchAccess } from "@/lib/rbac/scope";
import { ForbiddenError } from "@/lib/rbac/errors";
import type { AppSession } from "@/lib/auth/session";

const db = new PrismaClient();

function sessionFor(overrides: Partial<AppSession>): AppSession {
  return {
    sessionId: "test-session",
    userId: "test-user",
    role: "PARENT",
    username: null,
    mobile: null,
    branchId: null,
    studentId: null,
    guardianId: null,
    staffMemberId: null,
    displayName: "Test",
    isSuperAdmin: false,
    permissionGrants: [],
    ...overrides,
  };
}

describe("RBAC data isolation (Section 9)", () => {
  let orgId: string;
  let branchAId: string;
  let branchBId: string;
  let studentAId: string;
  let studentBId: string;
  let guardianAId: string;
  let guardianBId: string;

  beforeAll(async () => {
    const org = await db.organization.create({ data: { name: `RBAC Test Org ${Date.now()}` } });
    orgId = org.id;

    const branchA = await db.branch.create({ data: { organizationId: orgId, name: "Branch A" } });
    const branchB = await db.branch.create({ data: { organizationId: orgId, name: "Branch B" } });
    branchAId = branchA.id;
    branchBId = branchB.id;

    const studentA = await db.student.create({
      data: {
        admissionNumber: `RBAC-TEST-A-${Date.now()}`,
        branchId: branchAId,
        firstName: "Student",
        lastName: "A",
        dob: new Date("2015-01-01"),
        gender: "MALE",
      },
    });
    const studentB = await db.student.create({
      data: {
        admissionNumber: `RBAC-TEST-B-${Date.now()}`,
        branchId: branchAId,
        firstName: "Student",
        lastName: "B",
        dob: new Date("2015-01-01"),
        gender: "FEMALE",
      },
    });
    studentAId = studentA.id;
    studentBId = studentB.id;

    const guardianA = await db.guardian.create({
      data: { firstName: "Guardian", lastName: "A", phone: `9${Date.now().toString().slice(-9)}` },
    });
    const guardianB = await db.guardian.create({
      data: { firstName: "Guardian", lastName: "B", phone: `8${Date.now().toString().slice(-9)}` },
    });
    guardianAId = guardianA.id;
    guardianBId = guardianB.id;

    await db.studentGuardian.create({
      data: { studentId: studentAId, guardianId: guardianAId, relationship: "FATHER", isPrimary: true },
    });
    await db.studentGuardian.create({
      data: { studentId: studentBId, guardianId: guardianBId, relationship: "FATHER", isPrimary: true },
    });
  });

  afterAll(async () => {
    await db.studentGuardian.deleteMany({ where: { OR: [{ studentId: studentAId }, { studentId: studentBId }] } });
    await db.student.deleteMany({ where: { id: { in: [studentAId, studentBId] } } });
    await db.guardian.deleteMany({ where: { id: { in: [guardianAId, guardianBId] } } });
    await db.branch.deleteMany({ where: { id: { in: [branchAId, branchBId] } } });
    await db.organization.delete({ where: { id: orgId } });
    await db.$disconnect();
  });

  it("lets a parent access their own linked child", async () => {
    const session = sessionFor({ role: "PARENT", guardianId: guardianAId });
    await expect(assertOwnStudent(session, studentAId)).resolves.toBeUndefined();
  });

  it("blocks a parent from accessing another family's child by ID manipulation", async () => {
    const session = sessionFor({ role: "PARENT", guardianId: guardianAId });
    await expect(assertOwnStudent(session, studentBId)).rejects.toThrow(ForbiddenError);
  });

  it("lets a student access their own record", async () => {
    const session = sessionFor({ role: "STUDENT", studentId: studentAId });
    await expect(assertOwnStudent(session, studentAId)).resolves.toBeUndefined();
  });

  it("blocks a student from accessing another student's record by ID manipulation", async () => {
    const session = sessionFor({ role: "STUDENT", studentId: studentAId });
    await expect(assertOwnStudent(session, studentBId)).rejects.toThrow(ForbiddenError);
  });

  it("allows a branch-scoped admin to act on their own branch", () => {
    const session = sessionFor({ role: "ADMIN", branchId: branchAId, isSuperAdmin: false });
    expect(() => assertBranchAccess(session, branchAId)).not.toThrow();
  });

  it("blocks a branch-scoped admin from acting on a different branch", () => {
    const session = sessionFor({ role: "ADMIN", branchId: branchAId, isSuperAdmin: false });
    expect(() => assertBranchAccess(session, branchBId)).toThrow(ForbiddenError);
  });

  it("allows an org-wide admin (branchId: null) to act on any branch", () => {
    const session = sessionFor({ role: "ADMIN", branchId: null, isSuperAdmin: true });
    expect(() => assertBranchAccess(session, branchAId)).not.toThrow();
    expect(() => assertBranchAccess(session, branchBId)).not.toThrow();
  });
});
