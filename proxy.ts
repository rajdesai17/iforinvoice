import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/clients/:path*",
    "/items/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
