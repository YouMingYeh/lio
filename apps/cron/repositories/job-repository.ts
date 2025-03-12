import { createSupabaseClient } from "@/lib/supabase.js";
import {
  camelToSnakeCase,
  snakeToCamelCase,
  Job,
  JobInsert,
  JobUpdate,
} from "@/types.js";

export async function getJobs(): Promise<
  { data: Job[]; error: null } | { data: null; error: Error }
> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("job").select("*");
  if (error) {
    return { data: null, error };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function getPendingJobs(): Promise<
  { data: Job[]; error: null } | { data: null; error: Error }
> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("job")
    .select("*")
    .eq("status", "pending");
  if (error) {
    return { data: null, error };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function updateJobById(id: string, updates: JobUpdate) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("job")
    .update(camelToSnakeCase(updates))
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    console.error("Failed to update job:", error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function createJob(job: JobInsert) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("job")
    .insert(camelToSnakeCase(job))
    .select("*")
    .single();
  if (error) {
    console.error("Failed to create job:", error.message);
    return { data: null, error };
  }
  return { data, error: null };
}
