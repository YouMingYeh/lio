"use server";

import { Tables, TablesInsert } from "@/database.types";
import { createClient } from "@/lib/supabase/server";
import {
  camelToSnakeCase,
  KeysToCamelCase,
  snakeToCamelCase,
} from "@/lib/utils";

type Feedback = Tables<"feedback">;
type FeedbackCreatePayload = TablesInsert<"feedback">;

export async function createFeedback(
  creates: KeysToCamelCase<FeedbackCreatePayload>,
): Promise<
  | {
      data: KeysToCamelCase<Feedback>;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .insert(camelToSnakeCase(creates))
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
