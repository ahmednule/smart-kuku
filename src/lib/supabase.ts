import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const getRequiredEnv = (name: string, value?: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () =>
  createBrowserClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      supabasePublishableKey
    )
  );

export const getServerSupabase = () =>
  createSupabaseClient(
    getRequiredEnv("SUPABASE_URL", process.env.SUPABASE_URL || supabaseUrl),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

export const getSupabasePublicUrl = (path?: string | null) => {
  if (!path) return "";

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl).replace(
    /\/$/,
    ""
  );
  const normalizedPath = path.replace(/^\/+/, "");

  return `${baseUrl}/storage/v1/object/public/images/${normalizedPath}`;
};