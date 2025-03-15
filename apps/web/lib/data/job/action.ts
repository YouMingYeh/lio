"use server";

import { createClient } from "@/lib/supabase/service";
import { camelToSnakeCase, snakeToCamelCase } from "@/lib/utils";
import { Job, JobInsert, JobUpdate } from "@/types/database";

export async function getJobsByUserId(userId: string): Promise<
  | {
      data: Job[];
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
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

export async function getJobById(id: string): Promise<
  | {
      data: Job;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job")
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
    data: snakeToCamelCase(data),
    error: null,
  };
}

export async function updateJobById(
  id: string,
  updates: JobUpdate,
): Promise<
  | {
      data: Job;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job")
    .update(camelToSnakeCase(updates))
    .eq("id", id)
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

export async function createJob(creates: JobInsert): Promise<
  | {
      data: Job;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job")
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

export async function deleteJobById(id: string): Promise<
  | {
      data: Job;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job")
    .delete()
    .eq("id", id)
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
