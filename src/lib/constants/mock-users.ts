import type { UserRole } from "@/lib/validators/auth";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "AKTIF" | "NONAKTIF";
  created_at: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "u-1",
    name: "Budi Santoso",
    email: "budi@gudang.co",
    role: "ADMIN",
    status: "AKTIF",
    created_at: "2026-01-01",
  },
  {
    id: "u-2",
    name: "Siti Rahayu",
    email: "siti@gudang.co",
    role: "SUPERVISOR",
    status: "AKTIF",
    created_at: "2026-01-05",
  },
  {
    id: "u-3",
    name: "Andi Pratama",
    email: "andi@gudang.co",
    role: "STAFF",
    status: "AKTIF",
    created_at: "2026-01-10",
  },
  {
    id: "u-4",
    name: "Dewi Lestari",
    email: "dewi@gudang.co",
    role: "STAFF",
    status: "AKTIF",
    created_at: "2026-02-01",
  },
  {
    id: "u-5",
    name: "Rudi Hermawan",
    email: "rudi@gudang.co",
    role: "AUDITOR",
    status: "AKTIF",
    created_at: "2026-02-15",
  },
  {
    id: "u-6",
    name: "Rina Wati",
    email: "rina@gudang.co",
    role: "STAFF",
    status: "NONAKTIF",
    created_at: "2026-03-01",
  },
  {
    id: "u-7",
    name: "Joko Widodo",
    email: "joko@gudang.co",
    role: "SUPERVISOR",
    status: "AKTIF",
    created_at: "2026-03-10",
  },
];
