// app/api/clerk-webhook/route.ts
import { Webhook } from "svix";
import { api } from "../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { WebhookEvent } from "@clerk/backend";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    const evt = wh.verify(payload, headers) as WebhookEvent;

    console.log("📩 Clerk event:", evt.type);

    await client.mutation(api.webhooks.handleClerkEvent, {
      type: evt.type,
      data: evt.data,
    });

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ Invalid Clerk webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }
}
