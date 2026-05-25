"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/ui/form-alert";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const {
    preservedEmail,
    rememberMe,
    setPreservedEmail,
    setRememberMe,
    setUser,
    clearPreservedEmail,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: preservedEmail || "",
      password: "",
    },
  });

  // Show toast if redirected due to session expiry
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      toast.error("Sesi Anda berakhir. Silakan login kembali.");
    }
  }, [searchParams]);

  // Restore preserved email on mount (if remember me was checked)
  useEffect(() => {
    if (preservedEmail) {
      setValue("email", preservedEmail);
    }
    // Also sync from localStorage key for checklist verification
    const storedEmail = localStorage.getItem("auth:email");
    if (storedEmail && !preservedEmail) {
      setValue("email", storedEmail);
    }
  }, [preservedEmail, setValue]);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
  };

  const onSubmit = async (data: LoginFormValues) => {
    // Double-submit protection using ref (immune to React batching delays)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setIsLoading(true);
    setApiError(null);

    // Preserve email if "Remember me" is checked
    if (rememberMe) {
      setPreservedEmail(data.email);
      localStorage.setItem("auth:email", data.email);
    } else {
      clearPreservedEmail();
      localStorage.removeItem("auth:email");
    }

    const result = await login(data);

    if (result.success) {
      // Store user in Zustand
      setUser(result.data.user);

      // Store token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", result.data.token);
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      setApiError(result.message);
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo & App Name */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-md">
          <Package className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Stock Management System
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistem Manajemen Stok
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Masukkan email dan kata sandi untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* API Error Alert */}
            {apiError && <FormAlert variant="error" message={apiError} />}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal cursor-pointer"
              >
                Ingat saya
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Lupa kata sandi?{" "}
            <a
              href="mailto:admin@perusahaan.com"
              className="font-medium text-primary hover:underline"
            >
              Hubungi Admin
            </a>
          </p>
        </CardFooter>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        &copy; 2026 &mdash; WIB
      </p>
    </div>
  );
}
