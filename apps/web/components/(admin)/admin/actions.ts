"use server";

import { Json } from "@/database.types";
import { createClient } from "@/lib/supabase/service";
import { camelToSnakeCase, snakeToCamelCase } from "@/lib/utils";

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function getMessagesByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function createMessage(payload: {
  userId: string;
  content: Json;
  role: "user" | "assistant";
  lineMessageId?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message")
    .insert([camelToSnakeCase(payload)]);
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: snakeToCamelCase(data), error: null };
}
