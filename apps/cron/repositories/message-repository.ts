import { createSupabaseClient } from "@/lib/supabase.js";
import {
  camelToSnakeCase,
  Message,
  MessageInsert,
  snakeToCamelCase,
  User,
} from "@/types.js";

export async function createUserMessage(
  userMessage: MessageInsert,
): Promise<{ data: Message; error: null } | { data: null; error: string }> {
  const supabase = createSupabaseClient();
  const { data: message, error } = await supabase
    .from("message")
    .insert(camelToSnakeCase(userMessage))
    .select("*")
    .single();
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }
  return {
    data: snakeToCamelCase(message),
    error: null,
  };
}

export async function getUserById(
  id: string,
): Promise<{ data: User; error: null } | { data: null; error: string }> {
  const supabase = createSupabaseClient();
  const { data: user, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }
  return {
    data: snakeToCamelCase(user),
    error: null,
  };
}
