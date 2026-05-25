"use client";

import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Selamat datang, {user?.name ?? "Pengguna"}. Pilih menu di sidebar untuk memulai.
      </p>
    </div>
  );
}
