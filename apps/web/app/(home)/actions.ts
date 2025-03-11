"use server";

import { createClient } from "@/lib/supabase/service";
import { camelToSnakeCase, snakeToCamelCase } from "@/lib/utils";
import { TaskInsert } from "@/types/database";

export async function getTasksByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function createTask(payload: TaskInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
    .insert(camelToSnakeCase(payload));

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
    .eq("user_id", userId);

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: snakeToCamelCase(data), error: null };
}

export async function deleteTaskById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("task").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function updateTaskById(id: string, payload: Partial<TaskInsert>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task")
    .update(camelToSnakeCase(payload))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function deleteTasksByUserId(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("task").delete().eq("user_id", userId);
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

export async function deleteMessagesByUserId(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("message")
    .delete()
    .eq("user_id", userId);
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}
