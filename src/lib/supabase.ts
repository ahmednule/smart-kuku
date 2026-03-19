import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_IMAGES_BUCKET = "images";

const getRequiredEnv = (name: string, value?: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const getServiceRoleKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

const isPublishableKey = (key: string) => key.startsWith("sb_publishable_");

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
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", getServiceRoleKey())
  );

export const validateSupabaseServiceRoleKey = () => {
  const key = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", getServiceRoleKey());

  if (isPublishableKey(key)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Set it to your Supabase service-role/secret key."
    );
  }

  return key;
};

let isImagesBucketEnsured = false;

const isRlsPolicyError = (message?: string) =>
  (message || "").toLowerCase().includes("row-level security policy");

export const ensureImagesBucketExists = async (force = false) => {
  if (isImagesBucketEnsured && !force) return;

  const supabase = getServerSupabase();
  const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(
    SUPABASE_IMAGES_BUCKET
  );

  if (bucket && !getBucketError) {
    isImagesBucketEnsured = true;
    return;
  }

  const shouldCreate =
    !getBucketError ||
    getBucketError.message?.toLowerCase().includes("not found") ||
    (typeof (getBucketError as { status?: unknown }).status === "number" &&
      (getBucketError as { status?: number }).status === 404);

  if (!shouldCreate) {
    throw new Error(getBucketError.message || "Unable to verify storage bucket");
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    SUPABASE_IMAGES_BUCKET,
    {
      public: true,
      fileSizeLimit: "20MB",
    }
  );

  // If we don't have service-role privileges, we can't create buckets here.
  // Let callers continue to upload, which may still work when bucket already exists.
  if (createBucketError && isRlsPolicyError(createBucketError.message)) {
    return;
  }

  // Ignore duplicate creation race from concurrent requests.
  if (
    createBucketError &&
    !createBucketError.message?.toLowerCase().includes("already exists")
  ) {
    throw new Error(createBucketError.message || "Unable to create storage bucket");
  }

  isImagesBucketEnsured = true;
};

export const getSupabasePublicUrl = (path?: string | null) => {
  if (!path) return "";

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl).replace(
    /\/$/,
    ""
  );
  const normalizedPath = path.replace(/^\/+/, "");
  const bucketPrefix = `${SUPABASE_IMAGES_BUCKET}/`;
  const objectPath = normalizedPath.startsWith(bucketPrefix)
    ? normalizedPath.slice(bucketPrefix.length)
    : normalizedPath;

  return `${baseUrl}/storage/v1/object/public/${SUPABASE_IMAGES_BUCKET}/${objectPath}`;
};