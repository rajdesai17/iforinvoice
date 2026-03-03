"use client";

import { toast } from "sonner";

/**
 * Checks if a failed action result is an UNAUTHORIZED (session expired) error.
 * If so, shows a toast and redirects to sign-in.
 * Returns true if the session expired — caller should return early.
 */
export function isSessionExpired(result: {
  success: false;
  code?: string;
}): boolean {
  if (result.code === "UNAUTHORIZED") {
    toast.error("Session expired. Please sign in again.");
    setTimeout(() => {
      window.location.href = "/auth/sign-in";
    }, 0);
    return true;
  }
  return false;
}
