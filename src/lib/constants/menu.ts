import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  ClipboardList,
  BarChart3,
  FileSearch,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/validators/auth";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "SUPERVISOR", "STAFF", "AUDITOR"],
  },
  {
    label: "Inventaris",
    href: "/dashboard/inventory",
    icon: Package,
    allowedRoles: ["ADMIN", "SUPERVISOR", "STAFF"],
  },
  {
    label: "Penerimaan",
    href: "/dashboard/receiving",
    icon: PackagePlus,
    allowedRoles: ["ADMIN", "SUPERVISOR", "STAFF"],
  },
  {
    label: "Pengeluaran",
    href: "/dashboard/dispatching",
    icon: PackageMinus,
    allowedRoles: ["ADMIN", "SUPERVISOR", "STAFF"],
  },
  {
    label: "Penyesuaian",
    href: "/dashboard/adjustments",
    icon: ClipboardList,
    allowedRoles: ["ADMIN", "SUPERVISOR"],
  },
  {
    label: "Laporan",
    href: "/dashboard/reports",
    icon: BarChart3,
    allowedRoles: ["ADMIN", "SUPERVISOR", "AUDITOR"],
  },
  {
    label: "Jejak Audit",
    href: "/dashboard/audit",
    icon: FileSearch,
    allowedRoles: ["ADMIN", "SUPERVISOR", "AUDITOR"],
  },
  {
    label: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    allowedRoles: ["ADMIN"],
  },
];

/** Role display labels in Bahasa Indonesia */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  STAFF: "Staff",
  AUDITOR: "Auditor",
};

/** Role badge color classes */
export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  SUPERVISOR: "bg-amber-100 text-amber-700",
  STAFF: "bg-blue-100 text-blue-700",
  AUDITOR: "bg-green-100 text-green-700",
};
