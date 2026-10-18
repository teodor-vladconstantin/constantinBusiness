import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Message = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

export async function insertMessage(v: { name: string; email: string; message: string }): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin().from("messages").insert(v);
    return !error;
  } catch {
    // Missing or wrong Supabase settings. The visitor sees a retry message.
    return false;
  }
}

export async function listMessages(): Promise<Message[]> {
  const { data, error } = await supabaseAdmin().from("messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load messages");
  return data as Message[];
}

export async function getMessage(id: string): Promise<Message | null> {
  const { data } = await supabaseAdmin().from("messages").select("*").eq("id", id).maybeSingle();
  return (data as Message | null) ?? null;
}

export async function setRead(id: string, read: boolean): Promise<void> {
  const { error } = await supabaseAdmin().from("messages").update({ read }).eq("id", id);
  if (error) throw new Error("Could not update the message");
}

export async function removeMessage(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("messages").delete().eq("id", id);
  if (error) throw new Error("Could not delete the message");
}
