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

/**
 * Zod schema for updating an existing user.
 * Password is optional — only validated if provided.
 * Email is excluded (read-only on edit form).
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama wajib diisi" })
    .max(100, { message: "Nama maksimal 100 karakter" }),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "Role wajib dipilih" }),
  }),
  status: z.enum(USER_STATUSES, {
    errorMap: () => ({ message: "Status wajib dipilih" }),
  }),
  newPassword: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return val.length >= 8;
      },
      { message: "Kata sandi baru minimal 8 karakter" },
    )
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /[A-Z]/.test(val);
      },
      { message: "Kata sandi baru harus mengandung minimal 1 huruf besar" },
    )
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /[0-9]/.test(val);
      },
      { message: "Kata sandi baru harus mengandung minimal 1 angka" },
    ),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
