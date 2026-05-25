"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "@/lib/constants/menu";
import type { UserRole } from "@/lib/validators/auth";

interface SidebarNavProps {
  role: UserRole;
  onItemClick?: () => void;
}

/**
 * Sidebar navigation with RBAC-filtered menu items and active state.
 */
export function SidebarNav({ role, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(role)
  );

  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Menu utama">
      {filteredItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
