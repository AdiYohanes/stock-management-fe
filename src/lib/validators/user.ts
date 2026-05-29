import { z } from "zod";

/**
 * User roles enum values (matches UserRole type from auth.ts)
 */
export const USER_ROLES = ["ADMIN", "SUPERVISOR", "STAFF", "AUDITOR"] as const;

/**
 * User status enum values (matches UserStatus type from types/user.ts)
 */
export const USER_STATUSES = ["AKTIF", "NONAKTIF", "TERKUNCI"] as const;

/**
 * Zod schema for creating a new user.
 * All error messages in Bahasa Indonesia per product requirements.
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama wajib diisi" })
    .max(100, { message: "Nama maksimal 100 karakter" }),
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(1, { message: "Kata sandi wajib diisi" })
    .min(8, { message: "Kata sandi minimal 8 karakter" })
    .regex(/[A-Z]/, {
      message: "Kata sandi harus mengandung minimal 1 huruf besar",
    })
    .regex(/[0-9]/, {
      message: "Kata sandi harus mengandung minimal 1 angka",
    }),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "Role wajib dipilih" }),
  }),
  status: z.enum(USER_STATUSES, {
    errorMap: () => ({ message: "Status wajib dipilih" }),
  }),
  notes: z
    .string()
    .max(300, { message: "Catatan maksimal 300 karakter" })
    .optional()
    .or(z.literal("")),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
