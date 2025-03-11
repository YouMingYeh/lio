"use server";

import { Tables, TablesUpdate } from "@/database.types";
import { createClient } from "@/lib/supabase/service";
import {
  camelToSnakeCase,
  KeysToCamelCase,
  snakeToCamelCase,
} from "@/lib/utils";

type User = Tables<"user">;
type UserUpdatePayload = TablesUpdate<"user">;

export async function updateUserByUserId(
  userId: string,
  user: KeysToCamelCase<UserUpdatePayload>,
): Promise<
  | {
      data: KeysToCamelCase<User>;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user")
    .update(camelToSnakeCase(user))
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: snakeToCamelCase(data),
    error: null,
  };
}
