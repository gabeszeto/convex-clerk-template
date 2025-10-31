"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2">
          Convex + Clerk + Next.js
        </h1>
        <p className="text-gray-600 mb-6">
          A minimal starter template for multi-tenant apps with authentication.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <UserButton />
            <Link
              href="/dashboard"
              className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </SignedIn>
      </div>

      <footer className="text-gray-400 text-sm mt-10">
        Built with ❤️ using Convex + Clerk + Next.js
      </footer>
    </main>
  );
}
