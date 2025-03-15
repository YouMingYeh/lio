"use server";

import { createClient } from "@/lib/supabase/service";
import { camelToSnakeCase, snakeToCamelCase } from "@/lib/utils";
import { Task, TaskInsert, TaskUpdate } from "@/types/database";

export async function getTasksByUserId(userId: string): Promise<
  | {
      data: Task[];
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // New tasks first
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

export async function getTaskById(id: string): Promise<
  | {
      data: Task;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
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

export async function updateTaskById(
  id: string,
  updates: TaskUpdate,
): Promise<
  | {
      data: Task;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
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

export async function createTask(creates: TaskInsert): Promise<
  | {
      data: Task;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
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

export async function deleteTaskById(id: string): Promise<
  | {
      data: Task;
      error: null;
    }
  | {
      data: null;
      error: string;
    }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
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
