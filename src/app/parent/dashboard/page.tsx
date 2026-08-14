import { Bell, Image as ImageIcon, Video, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickLinksGrid } from "@/components/shared/quick-links-grid";

const QUICK_LINKS = [
  { label: "Notifications", href: "/parent/notifications", icon: Bell },
  { label: "Gallery", href: "/parent/gallery", icon: ImageIcon },
  { label: "Videos", href: "/parent/videos", icon: Video },
  { label: "Chat", href: "/parent/chat", icon: MessageCircle },
];

export default async function ParentDashboardPage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({
        where: { guardianId: session.guardianId },
        include: { student: { include: { branch: true, section: { include: { course: true } } } } },
      })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">
        {links.length > 1 ? "Your children" : "Your child"}
      </h1>

      {links.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No children are linked to your account yet. Contact the school office if this looks wrong.
          </CardContent>
        </Card>
      ) : (
        links.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <CardTitle>{link.student.firstName} {link.student.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p>Admission No. {link.student.admissionNumber} · {link.student.branch.name}</p>
              <p>
                {link.student.section
                  ? `${link.student.section.course.name} - ${link.student.section.name}`
                  : "Not yet assigned to a section"}
              </p>
            </CardContent>
          </Card>
        ))
      )}

      <QuickLinksGrid links={QUICK_LINKS} />

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Attendance, exam results, fee status, and timetable views will appear here as those modules roll out.
        </CardContent>
      </Card>
    </div>
  );
}
