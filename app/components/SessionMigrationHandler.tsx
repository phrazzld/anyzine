"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { getClientSessionId } from "@/lib/sessionMigration";

/**
 * Handles automatic session migration when anonymous users authenticate
 * Transfers rate limit history from session-based tracking to user-based tracking
 */
export function SessionMigrationHandler() {
  const { user } = useUser();
  const migrateSession = useMutation("rateLimits.migrateSession" as any);
  const hasAttemptedMigration = useRef(false);
  
  useEffect(() => {
    // Only attempt migration once per authentication
    if (user?.id && !hasAttemptedMigration.current) {
      hasAttemptedMigration.current = true;
      
      // Get the session ID from cookie
      const sessionId = getClientSessionId();
      
      if (sessionId) {
        // Migrate the session to the authenticated user
        migrateSession({ 
          sessionId, 
          userId: user.id 
        })
          .then(() => {
            console.log('[SessionMigration] Successfully migrated anonymous session to user:', user.id);
          })
          .catch((error) => {
            console.error('[SessionMigration] Failed to migrate session:', error);
          });
      }
    }
    
    // Reset migration flag when user logs out
    if (!user && hasAttemptedMigration.current) {
      hasAttemptedMigration.current = false;
    }
  }, [user, user?.id, migrateSession]);
  
  // This component doesn't render anything
  return null;
}