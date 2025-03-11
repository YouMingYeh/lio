"use server";

import { createClient } from "@/lib/supabase/service";
import { flag } from "flags/next";

export const wordGeneratorFlag = flag({
  key: "word-generator-flag",
  async decide() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("flag")
      .select("*")
      .eq("key", "word-generator-flag")
      .single();
    if (error) {
      console.error("Failed to fetch flag", error);
      return false;
    }
    return data.up;
  },
});

export const wordStatisticsFlag = flag({
  key: "word-statistics-flag",
  async decide() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("flag")
      .select("*")
      .eq("key", "word-statistics-flag")
      .single();
    if (error) {
      console.error("Failed to fetch flag", error);
      return false;
    }
    return data.up;
  },
});
