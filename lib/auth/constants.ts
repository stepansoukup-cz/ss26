export const SESSION_COOKIE = "ss26_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dní

export const ADMIN_PUBLIC_PATHS = [
  "/admin/prihlaseni",
  "/admin/zapomenute-heslo",
] as const;
