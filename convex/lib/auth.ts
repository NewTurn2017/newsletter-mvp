type AuthContext = {
  auth: {
    getUserIdentity(): Promise<{ email?: string | null } | null>;
  };
};

export async function requireAdmin(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) throw new Error("Unauthorized");
  const configuredAdmins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (configuredAdmins.length > 0 && !configuredAdmins.includes(identity.email.toLowerCase())) {
    throw new Error("Admin access required");
  }
  return identity;
}
