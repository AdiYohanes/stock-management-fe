import { AxiosError } from "axios";
import apiClient from "./client";
import type {
  LoginFormValues,
  LoginSuccessResponse,
  LoginErrorResponse,
} from "@/lib/validators/auth";

/**
 * Error codes mapped to user-friendly messages in Bahasa Indonesia.
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email atau kata sandi salah. Silakan coba lagi.",
  ACCOUNT_LOCKED:
    "Akun Anda telah dikunci karena terlalu banyak percobaan login. Hubungi admin untuk membuka kunci.",
  NETWORK_ERROR:
    "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
  UNKNOWN_ERROR: "Terjadi kesalahan. Silakan coba beberapa saat lagi.",
};

export interface LoginResult {
  success: true;
  data: LoginSuccessResponse["data"];
}

export interface LoginError {
  success: false;
  code: string;
  message: string;
}

/**
 * Mock login for development.
 * Replace with real API call when backend is ready.
 */
async function mockLogin(
  credentials: LoginFormValues
): Promise<LoginResult | LoginError> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock valid credentials
  if (
    credentials.email === "admin@demo.com" &&
    credentials.password === "Demo123!"
  ) {
    const token = "mock-jwt-token-" + Date.now();
    return {
      success: true,
      data: {
        user: {
          id: "usr-001",
          name: "Admin User",
          email: credentials.email,
          role: "ADMIN",
        },
        token,
      },
    };
  }

  // Mock locked account
  if (credentials.email === "locked@demo.com") {
    return {
      success: false,
      code: "ACCOUNT_LOCKED",
      message: ERROR_MESSAGES.ACCOUNT_LOCKED!,
    };
  }

  // Default: invalid credentials
  return {
    success: false,
    code: "INVALID_CREDENTIALS",
    message: ERROR_MESSAGES.INVALID_CREDENTIALS!,
  };
}

/**
 * Perform login API call.
 * Currently uses mock; switch USE_MOCK to false when backend is ready.
 */
const USE_MOCK = true;

export async function login(
  credentials: LoginFormValues
): Promise<LoginResult | LoginError> {
  if (USE_MOCK) {
    return mockLogin(credentials);
  }

  try {
    const response = await apiClient.post<LoginSuccessResponse>(
      "/auth/login",
      credentials
    );

    const { data } = response.data;

    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.token);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      // Server responded with an error
      if (error.response?.data) {
        const errorData = error.response.data as LoginErrorResponse;
        if (errorData.error) {
          return {
            success: false,
            code: errorData.error.code,
            message:
              ERROR_MESSAGES[errorData.error.code] ?? errorData.error.message,
          };
        }
      }

      // Network error (no response)
      if (!error.response) {
        return {
          success: false,
          code: "NETWORK_ERROR",
          message: ERROR_MESSAGES.NETWORK_ERROR!,
        };
      }
    }

    // Unknown error
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      message: ERROR_MESSAGES.UNKNOWN_ERROR!,
    };
  }
}
