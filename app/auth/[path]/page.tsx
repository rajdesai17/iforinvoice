"use client";

import { AuthView } from "@neondatabase/auth/react/ui";
import { usePathname } from "next/navigation";

export default function AuthPage() {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AuthView pathname={pathname} />
    </div>
  );
}
