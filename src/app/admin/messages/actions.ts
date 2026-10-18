"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { removeMessage, setRead } from "@/lib/messages";

export async function toggleRead(id: string, read: boolean) {
  await requireAdmin();
  await setRead(id, read);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await removeMessage(id);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
