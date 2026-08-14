import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { ChatListContent } from "@/components/shared/chat-list-content";

export default async function AdminChatPage() {
  await requirePermissionOrRedirect("comms.chat", "VIEW");
  return <ChatListContent portal="admin" />;
}
