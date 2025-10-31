import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { WebhookEvent } from "@clerk/backend";

/**
 * Mirrors Clerk users/orgs/memberships into Convex DB.
 * Idempotent and safe across out-of-order events.
 */
export const handleClerkEvent = mutation({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, { type, data }) => {
    console.log("📦 Convex handling Clerk event:", type);

    switch (type) {
      // --- USERS ---
      case "user.created":
      case "user.updated":
        await upsertUser(ctx, data);
        break;
      case "user.deleted":
        if (data?.id) await deleteUser(ctx, data.id);
        break;

      // --- ORGANISATIONS ---
      case "organization.created":
      case "organization.updated":
        if (data?.id) await upsertOrganisation(ctx, data);
        break;
      case "organization.deleted":
        if (data?.id) await deleteOrganisation(ctx, data.id);
        break;

      // --- MEMBERSHIPS ---
      case "organizationMembership.created":
      case "organizationMembership.updated":
        await upsertMembership(ctx, data);
        break;
      case "organizationMembership.deleted":
        await deleteMembership(ctx, data);
        break;

      default:
        console.log("⚠️ Unhandled Clerk event:", type);
    }
  },
});

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

async function upsertUser(ctx: any, data: any) {
  const clerkId = data.id ?? data.public_user_data?.user_id;
  if (!clerkId) return;

  const existing = await ctx.db
    .query("Users")
    .withIndex("by_subject", (q: any) => q.eq("subject", clerkId))
    .unique();

  const fields: Record<string, any> = { updatedAt: Date.now() };

  const email = data.email_addresses?.[0]?.email_address;
  if (email) fields.email = email;

  const fullName =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
    data.full_name ||
    "Unnamed";
  if (fullName) fields.name = fullName;

  if (data.image_url) fields.imageUrl = data.image_url;

  if (existing) {
    await ctx.db.patch(existing._id, fields);
    return;
  }

  await ctx.db.insert("Users", {
    subject: clerkId,
    createdAt: Date.now(),
    ...fields,
  });

  console.log(`✅ Created user ${clerkId}`);
}

async function deleteUser(ctx: any, id: string) {
  const user = await ctx.db
    .query("Users")
    .withIndex("by_subject", (q: any) => q.eq("subject", id))
    .unique();
  if (!user) return;

  const memberships = await ctx.db
    .query("OrganisationMembers")
    .withIndex("by_user", (q: any) => q.eq("userId", user._id))
    .collect();
  for (const m of memberships) await ctx.db.delete(m._id);

  await ctx.db.delete(user._id);
  console.log(`🗑️ Deleted user ${id}`);
}

// ----------------------------------------------------------------------

async function upsertOrganisation(ctx: any, data: any) {
  const orgId = data.id ?? data.organization?.id;
  if (!orgId) return;

  const existing = await ctx.db
    .query("Organisations")
    .withIndex("by_orgId", (q: any) => q.eq("orgId", orgId))
    .unique();

  const fields = {
    name: data.name ?? "Untitled Organisation",
    slug: data.slug ?? undefined,
    updatedAt: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, fields);
  } else {
    await ctx.db.insert("Organisations", {
      orgId,
      name: data.name ?? "Untitled Organisation",
      slug: data.slug ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  console.log(`🏢 Synced organisation ${orgId}`);
}

async function deleteOrganisation(ctx: any, orgId: string) {
  const org = await ctx.db
    .query("Organisations")
    .withIndex("by_orgId", (q: any) => q.eq("orgId", orgId))
    .unique();
  if (!org) return;

  const members = await ctx.db
    .query("OrganisationMembers")
    .withIndex("by_org", (q: any) => q.eq("orgId", org._id))
    .collect();
  for (const m of members) await ctx.db.delete(m._id);

  await ctx.db.delete(org._id);
  console.log(`🗑️ Deleted organisation ${orgId}`);
}

// ----------------------------------------------------------------------

async function upsertMembership(ctx: any, data: any) {
  const orgId = data.organization?.id;
  const userId = data.public_user_data?.user_id;
  const role = data.role ?? "org:member";
  if (!orgId || !userId) return;

  const [user, org] = await Promise.all([
    ensureUser(ctx, userId, data.public_user_data),
    ensureOrganisation(ctx, orgId, data.organization),
  ]);
  if (!user || !org) return;

  const existing = await ctx.db
    .query("OrganisationMembers")
    .withIndex("by_user_org", (q: any) =>
      q.eq("userId", user._id).eq("orgId", org._id)
    )
    .unique();

  if (existing) {
    if (existing.role !== role)
      await ctx.db.patch(existing._id, { role });
  } else {
    await ctx.db.insert("OrganisationMembers", {
      userId: user._id,
      orgId: org._id,
      role,
      joinedAt: Date.now(),
    });
  }

  console.log(`✅ Linked user ${userId} ↔ org ${orgId}`);
}

async function deleteMembership(ctx: any, data: any) {
  const orgId = data.organization?.id;
  const userId = data.public_user_data?.user_id;
  if (!orgId || !userId) return;

  const user = await ctx.db
    .query("Users")
    .withIndex("by_subject", (q: any) => q.eq("subject", userId))
    .unique();
  const org = await ctx.db
    .query("Organisations")
    .withIndex("by_orgId", (q: any) => q.eq("orgId", orgId))
    .unique();
  if (!user || !org) return;

  const existing = await ctx.db
    .query("OrganisationMembers")
    .withIndex("by_user_org", (q: any) =>
      q.eq("userId", user._id).eq("orgId", org._id)
    )
    .unique();
  if (existing) await ctx.db.delete(existing._id);
}

// ----------------------------------------------------------------------

async function ensureUser(ctx: any, clerkId: string, fallback: any) {
  const existing = await ctx.db
    .query("Users")
    .withIndex("by_subject", (q: any) => q.eq("subject", clerkId))
    .unique();
  if (existing) return existing;

  const inserted = await ctx.db.insert("Users", {
    subject: clerkId,
    name:
      `${fallback?.first_name ?? ""} ${fallback?.last_name ?? ""}`.trim() ||
      "Unnamed",
    email: fallback?.identifier ?? undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return await ctx.db.get(inserted);
}

async function ensureOrganisation(ctx: any, orgId: string, fallback: any) {
  const existing = await ctx.db
    .query("Organisations")
    .withIndex("by_orgId", (q: any) => q.eq("orgId", orgId))
    .unique();
  if (existing) return existing;

  const inserted = await ctx.db.insert("Organisations", {
    orgId,
    name: fallback?.name ?? "Untitled Organisation",
    slug: fallback?.slug ?? undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return await ctx.db.get(inserted);
}
