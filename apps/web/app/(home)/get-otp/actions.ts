"use server";

import { createClient } from "@/lib/supabase/service";

export async function createOtp() {
  const supabase = await createClient();
  const code = Math.floor(100000 + Math.random() * 900000);
  const { data, error } = await supabase
    .from("otp")
    .insert({
      code: code.toString(),
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
