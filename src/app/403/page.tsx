import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <ShieldAlert aria-hidden="true" className="size-12 text-danger" />
      <h1 className="text-xl font-semibold text-foreground">You don&apos;t have access to this page</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your account doesn&apos;t have permission to view this. If you think this is a mistake, contact your
        school administrator.
      </p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Go back home
      </Link>
    </main>
  );
}
