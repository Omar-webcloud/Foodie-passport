export const siteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://foodie-passport-bd.vercel.app",
).origin;
