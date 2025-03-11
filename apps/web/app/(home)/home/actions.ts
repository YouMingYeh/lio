"use server";

import { createClient } from "@/lib/supabase/service";

export async function createWait({
  email,
  name,
  message,
}: {
  email: string;
  name: string;
  message?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wait")
    .insert([{ email, name, message }]);
  if (error) {
    console.error("Error inserting data:", error);
    return { data: null, error };
  }
  return { data, error: null };
}
