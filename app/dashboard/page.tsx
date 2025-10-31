"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignedIn } from "@clerk/nextjs";

export default function Dashboard() {
    type ClerkIdentity = {
        name?: string;
        email?: string;
        picture?: string;
        org_name?: string;
        org_role?: string;
    };

    const identity = useQuery(api.identity.current, {}) as ClerkIdentity | undefined;

    return (
        <SignedIn>
            <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                {!identity ? (
                    <p className="text-gray-500">Loading identity...</p>
                ) : (
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <h2 className="text-xl font-medium">{identity.name}</h2>
                        <p className="text-gray-600">{identity.email}</p>

                        {identity?.org_name ? (
                            <p className="text-gray-800 font-semibold">
                                Organisation: {identity.org_name}
                            </p>
                        ) : (
                            <p className="text-gray-500 mt-4">Not in an organisation</p>
                        )}
                    </div>
                )}

                <Link
                    href="/"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                    Back to Home
                </Link>
            </main>
        </SignedIn>
    );
}
