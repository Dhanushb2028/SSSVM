"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { updateOwnProfile, changeOwnPassword } from "@/server/services/profile";
import { updateOwnProfileSchema, changePasswordSchema } from "@/lib/validation/auth";

export type ProfileFormState = { error?: string; success?: string };

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const parsed = updateOwnProfileSchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await updateOwnProfile(session, {
    firstName: parsed.data.firstName ?? "",
    lastName: parsed.data.lastName ?? "",
    email: parsed.data.email ?? "",
    phone: parsed.data.phone ?? "",
  });
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await changeOwnPassword(session, parsed.data.currentPassword, parsed.data.newPassword);
  if (!result.ok) return { error: result.error };
  return { success: "Password changed." };
}
