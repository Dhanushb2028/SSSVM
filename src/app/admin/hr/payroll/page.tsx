import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { listPayslips } from "@/server/services/payroll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { SalaryComponentForm, SalaryComponentList } from "./salary-component-forms";
import { SalaryStructureEditor } from "./salary-structure-editor";
import { GeneratePayslipsForm } from "./generate-payslips-form";
import { PayslipsList } from "./payslips-list";

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("hr.payroll", "VIEW");
  const sp = await searchParams;

  const [components, branches, staff] = await Promise.all([
    db.salaryComponent.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
    db.staffMember.findMany({ where: { deletedAt: null, status: "ACTIVE", ...(session.branchId ? { branchId: session.branchId } : {}) }, orderBy: { firstName: "asc" } }),
  ]);

  const branchId = (typeof sp.branchId === "string" ? sp.branchId : undefined) ?? branches[0]?.id ?? "";
  const staffMemberId = (typeof sp.staffMemberId === "string" ? sp.staffMemberId : undefined) ?? staff[0]?.id ?? "";

  const existing = staffMemberId ? await db.staffSalaryComponent.findMany({ where: { staffMemberId } }) : [];
  const existingAmounts = Object.fromEntries(existing.map((e) => [e.salaryComponentId, e.amount]));

  const payslips = await listPayslips(branchId || null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Payroll</h1>
        <p className="text-sm text-muted-foreground">Salary components, per-staff structure, and monthly payslip generation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Components</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SalaryComponentForm />
          <SalaryComponentList items={components} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salary Structure</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <UrlFilterSelect paramKey="staffMemberId" placeholder="Staff member" options={staff.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.employeeCode})` }))} className="w-72" />
          {staffMemberId ? (
            <SalaryStructureEditor staffMemberId={staffMemberId} components={components} existingAmounts={existingAmounts} />
          ) : (
            <p className="text-sm text-muted-foreground">No active staff found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payslips</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <UrlFilterSelect paramKey="branchId" placeholder="Branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
          <GeneratePayslipsForm branchId={branchId} />
          <PayslipsList payslips={payslips} />
        </CardContent>
      </Card>
    </div>
  );
}
