import { z } from "zod";

/**
 * Login form validation schema.
 * Error messages in Bahasa Indonesia as per product requirements.
 * This schema is shared with the backend for consistent validation.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(1, { message: "Kata sandi wajib diisi" })
    .min(8, { message: "Kata sandi minimal 8 karakter" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login API response types
 */
export type UserRole = "ADMIN" | "SUPERVISOR" | "STAFF" | "AUDITOR";

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginSuccessResponse {
  success: true;
  data: {
    user: LoginUser;
    token: string;
  };
}

export interface LoginErrorResponse {
  success: false;
  error: {
    code: "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED";
    message: string;
  };
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;
