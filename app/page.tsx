import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await cookies(),
  });

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
