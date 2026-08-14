import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Sign out"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
