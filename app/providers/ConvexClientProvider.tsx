"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { SessionMigrationHandler } from "@/app/components/SessionMigrationHandler";

// Determine which Convex deployment to use based on environment
const convexUrl = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_CONVEX_URL_PROD
  : process.env.NEXT_PUBLIC_CONVEX_URL_DEV;

if (!convexUrl) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_CONVEX_URL_${
      process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
    }`
  );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <SessionMigrationHandler />
      {children}
    </ConvexProviderWithClerk>
  );
}