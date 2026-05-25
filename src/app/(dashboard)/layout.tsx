"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardSidebar, MobileSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, checkSession } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      toast.error("Sesi Anda berakhir. Silakan login kembali.");
    }

    if (!checkSession()) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    setIsReady(true);
  }, [checkSession, router, searchParams]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar role={user.role} />

      <div className="lg:pl-64">
        <DashboardHeader
          user={user}
          mobileMenuTrigger={<MobileSidebar role={user.role} />}
        />
        <main className="min-h-[calc(100vh-4rem)] bg-muted/30 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
