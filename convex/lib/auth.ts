const ADMIN_EMAIL = "genie@codewithgenie.com";

type AuthContext = {
  auth: {
    getUserIdentity(): Promise<{ email?: string | null } | null>;
  };
};

export async function requireAdmin(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) throw new Error("Unauthorized");
  if (identity.email.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Admin access required");
  }
  return identity;
}
