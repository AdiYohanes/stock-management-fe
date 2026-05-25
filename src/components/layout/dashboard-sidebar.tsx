"use client";

import { useState } from "react";
import { Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { UserRole } from "@/lib/validators/auth";

interface DashboardSidebarProps {
  role: UserRole;
}

/** Logo + app name block shared between desktop and mobile */
function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Package className="h-5 w-5" aria-hidden="true" />
      </div>
      <span className="text-sm font-semibold">Stock Management</span>
    </div>
  );
}

/** Desktop fixed sidebar */
export function DashboardSidebar({ role }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card">
      <SidebarHeader />
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <SidebarNav role={role} />
      </ScrollArea>
    </aside>
  );
}

/** Mobile sidebar Sheet with trigger button */
export function MobileSidebar({ role }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Buka menu navigasi"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarHeader />
        <Separator />
        <ScrollArea className="flex-1 py-4">
          <SidebarNav role={role} onItemClick={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
