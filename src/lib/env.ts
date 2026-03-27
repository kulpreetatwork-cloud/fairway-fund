export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  senderEmail: process.env.SENDER_EMAIL ?? "updates@fairwayfund.demo",
  authSecret: process.env.AUTH_SECRET ?? "dev-only-fairwayfund-secret",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasStripeConfig() {
  return Boolean(env.stripeSecretKey);
}

export function hasEmailConfig() {
  return Boolean(env.resendApiKey);
}

export function hasSupabaseServiceConfig() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasCloudinaryConfig() {
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );
}
