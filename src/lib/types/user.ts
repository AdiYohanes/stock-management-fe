import type { UserRole } from "@/lib/validators/auth";

/** User account status */
export type UserStatus = "AKTIF" | "NONAKTIF" | "TERKUNCI";

/** Activity log entry for user profile */
export interface UserActivityLog {
  id: string;
  action: string;
  timestamp: string;
  description: string;
}

/** Full user account representation */
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  activity_logs: UserActivityLog[];
}
