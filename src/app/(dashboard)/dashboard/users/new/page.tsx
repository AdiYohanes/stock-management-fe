"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MOCK_USERS } from "@/lib/constants/mock-users";
import {
  createUserSchema,
  USER_ROLES,
  USER_STATUSES,
  type CreateUserFormValues,
} from "@/lib/validators/user";

/** Role display labels for dropdown */
const ROLE_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  STAFF: "Staff",
  AUDITOR: "Auditor",
};

/** Status display labels for dropdown */
const STATUS_LABELS: Record<(typeof USER_STATUSES)[number], string> = {
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
  TERKUNCI: "Terkunci",
};

export default function NewUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
      status: "AKTIF",
      notes: "",
    },
  });

  /**
   * Mock unique email validation against existing users.
   * Returns true if email is already taken.
   */
  const isEmailTaken = (email: string): boolean => {
    return MOCK_USERS.some(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    // Check email uniqueness against mock data
    if (isEmailTaken(data.email)) {
      setError("email", {
        type: "manual",
        message: "Email sudah terdaftar di sistem",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate 500ms loading delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    toast.success(
      "Pengguna berhasil ditambahkan! (Mock submit, belum ada backend)",
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Tambah Pengguna Baru</h1>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Masukkan nama lengkap"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contoh@perusahaan.id"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Kata Sandi */}
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Kata Sandi <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter, huruf besar & angka"
              className="pr-10"
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "password-error" : "password-hint"
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : (
            <p id="password-hint" className="text-xs text-muted-foreground">
              Minimal 8 karakter, mengandung huruf besar &amp; angka
            </p>
          )}
        </div>

        {/* Role & Status row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              id="role"
              {...register("role")}
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? "role-error" : undefined}
            >
              <option value="" disabled>
                Pilih role
              </option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
            {errors.role && (
              <p id="role-error" className="text-xs text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              {...register("status")}
              aria-invalid={!!errors.status}
              aria-describedby={errors.status ? "status-error" : undefined}
            >
              {USER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            {errors.status && (
              <p id="status-error" className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Catatan */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">
            Catatan{" "}
            <span className="text-muted-foreground font-normal">
              (opsional, maks 300 karakter)
            </span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Tambahkan catatan jika diperlukan..."
            rows={3}
            {...register("notes")}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? "notes-error" : undefined}
          />
          {errors.notes && (
            <p id="notes-error" className="text-xs text-destructive">
              {errors.notes.message}
            </p>
          )}
        </div>

        <Separator />

        {/* Submit button */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
