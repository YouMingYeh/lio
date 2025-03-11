"use server";

import { createClient } from "../../supabase/server";
import { Tables, TablesInsert, TablesUpdate } from "@/database.types";
import {
  camelToSnakeCase,
  KeysToCamelCase,
  snakeToCamelCase,
} from "@/lib/utils";
import { cache } from "react";

type User = Tables<"user">;
type UserUpdatePayload = TablesUpdate<"user">;
type UserCreatePayload = TablesInsert<"user">;

async function getUserRaw(): Promise<
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
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) {
    return {
      data: null,
      error: "User not found",
    };
  }
  const { data: user, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", supabaseUser?.id)
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

export const getUser = cache(getUserRaw);

export async function updateUser(
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
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) {
    return {
      data: null,
      error: "User not found",
    };
  }
  const { data, error } = await supabase
    .from("user")
    .update(camelToSnakeCase(user))
    .eq("id", supabaseUser?.id)
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

async function getUserByEmailRaw(email: string): Promise<
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
    .select("*")
    .eq("email", email)
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

export const getUserByEmail = cache(getUserByEmailRaw);
