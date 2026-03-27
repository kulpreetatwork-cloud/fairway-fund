import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseServiceConfig } from "@/lib/env";

// The app maps raw rows manually, so we keep the client untyped at the schema level here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedClient: any = null;

export function getSupabaseAdminClient() {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(env.supabaseUrl as string, env.supabaseServiceRoleKey as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedClient;
}
