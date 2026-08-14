"use client";

import { useActionState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessageAction } from "@/server/actions/chat-actions";

type FormState = { error?: string; success?: boolean };

export function ChatThreadView({
  studentId,
  messages,
  currentUserId,
}: {
  studentId: string;
  messages: { id: string; body: string; createdAt: Date; senderUserId: string; senderName: string }[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(sendChatMessageAction, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border border-border p-3">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>}
        {messages.map((m) => {
          const isMine = m.senderUserId === currentUserId;
          return (
            <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>
                {m.body}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {m.senderName} · {format(m.createdAt, "d MMM, h:mm a")}
              </p>
            </div>
          );
        })}
      </div>

      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="studentId" value={studentId} />
        <Input name="body" placeholder="Type a message…" required aria-label="Message" className="flex-1" />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </form>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}
