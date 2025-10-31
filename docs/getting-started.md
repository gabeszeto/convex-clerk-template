# 🚀 Getting Started

This guide walks you through setting up the **Convex + Clerk + Next.js Template** from scratch.  
You’ll connect **Convex** (your realtime backend), **Clerk** (authentication), and your local **Next.js** app.

---

## 🧱 Prerequisites

Before you begin, make sure you have:
- **Node.js** ≥ 18  
- **npm** or **pnpm** installed  
- A [**Convex**](https://convex.dev) account  
- A [**Clerk**](https://clerk.com) account  
- [**ngrok**](https://ngrok.com) or an alternative - for local webhook forwarding

---

## 1️⃣ Clone and Install

```bash
git clone https://github.com/gabeszeto/convex-clerk-template.git
cd convex-clerk-template
npm install
```

---

## 2️⃣ Set Up Convex

1. **Install the Convex CLI (if you haven’t already):**
   ```bash
   npm install -g convex
   ```

2. **Initialize a new Convex project:**
   ```bash
   npx convex dev
   ```

   This will:
   - Prompt you to sign in to Convex  
   - Create a local deployment (default: `dev`)  
   - Generate the `/convex/_generated` folder  

3. When asked, choose **“Create new project”** and note the project name — you’ll reference it in your environment file later.

---

## 3️⃣ Set Up Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Create a new project**  
2. Copy your API keys from **API Keys → Backend API Keys**
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
3. Add them to a new `.env.local` file in your project root:

   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
   ```

4. In **JWT Templates**, make sure your issuer domain matches `CLERK_JWT_ISSUER_DOMAIN`.

---

## 4️⃣ Configure Clerk → Convex Webhooks

Your Convex backend listens for Clerk events through the Next.js route `/api/clerk-webhook`.

To expose your local server for Clerk webhooks, run:

```bash
ngrok http 3000
```

You’ll get a public URL like:

```
https://abc123.ngrok.app
```

Now go back to your **Clerk Dashboard**:

1. Navigate to **Developers → Webhooks → Add endpoint**  
2. Use your ngrok URL as the endpoint:

   ```
   https://abc123.ngrok.app/api/clerk-webhook
   ```

3. Select these events:
   - `user.created`
   - `user.updated`
   - `organization.created`

4. Copy the **signing secret** and add it to `.env.local`:

   ```bash
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

---

## 5️⃣ Finish Configuring Convex

Add these Convex variables to `.env.local`:

```bash
CONVEX_DEPLOYMENT=dev
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

> 💡 Tip: You can find the Convex URL in the Convex dashboard or the terminal after running `npx convex dev`.

---

## 6️⃣ Run the App

Start both Convex, Next.js, and Ngrok:

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev

# Terminal 3
ngrok http 3000
```

Then open: [http://localhost:3000](http://localhost:3000)

You should now be able to:
- Sign in via Clerk  
- See webhook events syncing into Convex  
- Enjoy realtime updates in your dashboard 🎉

---

## ✅ Verify Everything Works

| Check | What You Should See |
|-------|----------------------|
| Clerk sign-in works | The app loads a Clerk sign-in UI |
| Convex functions run | `npx convex dev` shows no auth errors |
| Webhook triggers | User/org events appear in Convex logs |

---

## 🧾 Example `.env.local`

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxx
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

CONVEX_DEPLOYMENT=dev
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

---

## 🧠 Next Steps

- [Deployment Guide →](./deployment.md) — how to deploy to Vercel + Convex Cloud  
- [Architecture Overview →](./architecture.md) — understand the folder structure  

---

✨ That’s it!  
You now have a **multi-tenant, realtime, full-stack starter** ready for customization.
