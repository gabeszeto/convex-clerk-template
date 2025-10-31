import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- USERS (mirrors Clerk users) ---
  Users: defineTable({
    subject: v.string(), // Clerk user ID
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_subject", ["subject"]),

  // --- ORGANISATIONS (mirrors Clerk orgs) ---
  Organisations: defineTable({
    orgId: v.string(), // Clerk org ID
    name: v.string(),
    slug: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_orgId", ["orgId"]),

  // --- ORGANISATION MEMBERS ---
  OrganisationMembers: defineTable({
    userId: v.id("Users"),
    orgId: v.id("Organisations"),
    role: v.string(), // e.g. "org:admin" | "org:member"
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_user_org", ["userId", "orgId"]),
});
