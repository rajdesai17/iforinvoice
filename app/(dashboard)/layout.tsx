import { AppSidebar } from "@/components/layout/app-sidebar";

// Demo user ID for development (no auth)
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <AppSidebar />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
