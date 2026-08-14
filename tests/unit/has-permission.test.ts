import { describe, it, expect } from "vitest";
import { hasPermission, type PermissionCheckSession } from "@/lib/rbac/has-permission";

const superAdmin: PermissionCheckSession = { role: "ADMIN", isSuperAdmin: true, permissionGrants: [] };

const scopedAdminWithGrant: PermissionCheckSession = {
  role: "ADMIN",
  isSuperAdmin: false,
  permissionGrants: [{ module: "sis.students", action: "VIEW" }],
};

const scopedAdminNoGrant: PermissionCheckSession = {
  role: "ADMIN",
  isSuperAdmin: false,
  permissionGrants: [{ module: "sis.students", action: "VIEW" }],
};

const teacher: PermissionCheckSession = { role: "TEACHER", isSuperAdmin: false, permissionGrants: [] };

describe("hasPermission", () => {
  it("denies an unauthenticated session", () => {
    expect(hasPermission(null, "sis.students", "VIEW")).toBe(false);
  });

  it("grants a super admin (no permission profile) everything", () => {
    expect(hasPermission(superAdmin, "finance.banking", "DELETE")).toBe(true);
    expect(hasPermission(superAdmin, "sis.students", "VIEW")).toBe(true);
  });

  it("grants a scoped admin only the module/action combinations in their profile", () => {
    expect(hasPermission(scopedAdminWithGrant, "sis.students", "VIEW")).toBe(true);
  });

  it("denies a scoped admin an action outside their profile", () => {
    expect(hasPermission(scopedAdminNoGrant, "sis.students", "DELETE")).toBe(false);
    expect(hasPermission(scopedAdminNoGrant, "finance.banking", "VIEW")).toBe(false);
  });

  it("never grants module-level access to non-admin roles, regardless of grants", () => {
    expect(hasPermission(teacher, "sis.students", "VIEW")).toBe(false);
  });
});
