import { format } from "date-fns";
import { Cake } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { getTodaysBirthdays } from "@/server/services/birthdays";
import { Card, CardContent } from "@/components/ui/card";
import { SendWishButton } from "./send-wish-button";

export default async function BirthdaysPage() {
  const session = await requirePermissionOrRedirect("sis.birthdays", "VIEW");
  const students = await getTodaysBirthdays(session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Birthday List</h1>
        <p className="text-sm text-muted-foreground">Students celebrating a birthday today — {format(new Date(), "d MMMM yyyy")}.</p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Cake aria-hidden="true" className="size-8" />
            <p>No birthdays today.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-2 pt-6">
                <p className="font-medium text-foreground">
                  {s.firstName} {s.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.admissionNumber} {s.sectionLabel ? `· ${s.sectionLabel}` : ""}
                </p>
                <SendWishButton studentId={s.id} firstName={s.firstName} phone={s.contactPhone} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
