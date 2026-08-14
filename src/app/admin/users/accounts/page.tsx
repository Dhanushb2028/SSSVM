import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listUsers } from "@/server/services/users";
import { listBranchesForPicker } from "@/server/services/academic-years";
import { listAllPermissionProfilesForPicker } from "@/server/services/permission-profiles";
import { UsersTable } from "./users-table";

export default async function UserAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("users.accounts", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "username", dir: "asc" });
  const [{ rows, totalCount }, branches, profiles] = await Promise.all([
    listUsers(params, session.branchId),
    listBranchesForPicker(session.branchId),
    listAllPermissionProfilesForPicker(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">User Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Admin accounts are created directly here. Staff, student, and parent logins are generated from their
          master records once those modules are live.
        </p>
      </div>
      <UsersTable rows={rows} totalCount={totalCount} params={params} branches={branches} profiles={profiles} currentUserId={session.userId} />
    </div>
  );
}
