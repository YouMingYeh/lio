"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { data, error: error.message };
  }
  return { data, error: null };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return { data, error: error.message };
  }
  return { data, error: null };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}

export async function sendResetEmail(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      `${process.env.NEXT_PUBLIC_APP_URL}` + "/auth/reset/reset-password",
  });
  if (error) {
    return { data, error: error.message };
  }
  return { data, error: null };
}

export async function changePassword(newPassword: string, sessionCode: string) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(sessionCode);
  if (sessionError) {
    return { data: sessionData, error: sessionError.message };
  }
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    console.error(error);
    return { data, error: error.message };
  }
  return { data, error: null };
}
