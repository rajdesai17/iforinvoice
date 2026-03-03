import { auth } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default function proxy(request: NextRequest) {
  // Let server actions handle auth in their own handlers to avoid
  // middleware 307 redirects on `next-action` POSTs.
  const isServerActionPost =
    request.method === "POST" && request.headers.has("next-action");

  if (isServerActionPost) {
    return NextResponse.next();
  }

  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/clients/:path*",
    "/items/:path*",
    "/settings/:path*",
  ],
};
