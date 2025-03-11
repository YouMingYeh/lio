"use server";

import { Database } from "@/database.types";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const createClient = async () => {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};
