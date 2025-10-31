import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("Users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    return user ?? null;
  },
});
