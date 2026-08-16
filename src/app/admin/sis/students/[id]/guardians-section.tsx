"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Trash2, Star, KeyRound } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkGuardianAction, unlinkGuardianAction, generateGuardianLoginAction } from "@/server/actions/student-actions";

type FormState = { error?: string; success?: boolean };

type GuardianLink = {
  guardian: { id: string; firstName: string; lastName: string; phone: string; email: string | null; user?: { id: string } | null };
  relationship: string;
  isPrimary: boolean;
};

function GenerateGuardianLoginDialog({ studentId, guardianId, guardianName, mobile }: { studentId: string; guardianId: string; guardianName: string; mobile: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(generateGuardianLoginAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Generate login for ${guardianName}`}>
          <KeyRound aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Generate Login"
        description={`Creates a Parent portal login for ${guardianName}, using their mobile number ${mobile} to sign in.`}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="guardianId" value={guardianId} />
          <FormField id="guardian-login-password" label="Initial password" required hint="At least 8 characters.">
            <Input id="guardian-login-password" name="password" type="text" required minLength={8} />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddGuardianDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(linkGuardianAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus aria-hidden="true" />
          Add Guardian
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Add Guardian"
        description="Enter the guardian's mobile number. If they're already in the system, they'll be linked instead of duplicated."
      >
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="studentId" value={studentId} />
          <FormField id="g-phone" label="Mobile number" required>
            <Input id="g-phone" name="phone" required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="g-first" label="First name" required>
              <Input id="g-first" name="firstName" required />
            </FormField>
            <FormField id="g-last" label="Last name" required>
              <Input id="g-last" name="lastName" required />
            </FormField>
          </div>
          <FormField id="g-email" label="Email">
            <Input id="g-email" name="email" type="email" />
          </FormField>
          <Select name="relationship" defaultValue="FATHER">
            <FormField id="g-rel" label="Relationship" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value="FATHER">Father</SelectItem>
              <SelectItem value="MOTHER">Mother</SelectItem>
              <SelectItem value="GUARDIAN">Guardian</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="isPrimary" />
            Set as primary guardian
          </label>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GuardiansSection({ studentId, links }: { studentId: string; links: GuardianLink[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Guardians</CardTitle>
        <AddGuardianDialog studentId={studentId} />
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">No guardians linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li
                key={link.guardian.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-3 text-sm"
              >
                <div>
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    {link.guardian.firstName} {link.guardian.lastName}
                    {link.isPrimary && <Star aria-hidden="true" className="size-3.5 text-gold" />}
                    <span className="sr-only">{link.isPrimary ? "(primary guardian)" : ""}</span>
                  </p>
                  <p className="text-muted-foreground">
                    {link.relationship} · {link.guardian.phone}
                    {link.guardian.email ? ` · ${link.guardian.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center">
                  {!link.guardian.user && (
                    <GenerateGuardianLoginDialog
                      studentId={studentId}
                      guardianId={link.guardian.id}
                      guardianName={`${link.guardian.firstName} ${link.guardian.lastName}`}
                      mobile={link.guardian.phone}
                    />
                  )}
                  <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${link.guardian.firstName} ${link.guardian.lastName}`}
                    >
                      <Trash2 aria-hidden="true" className="text-danger" />
                    </Button>
                  }
                  title="Remove guardian"
                  description={`Unlink ${link.guardian.firstName} ${link.guardian.lastName} from this student?`}
                  confirmLabel="Remove"
                  action={unlinkGuardianAction}
                  hiddenFields={{ studentId, guardianId: link.guardian.id }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
