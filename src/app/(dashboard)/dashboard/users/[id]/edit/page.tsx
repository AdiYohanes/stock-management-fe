"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, UserCog } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore, isProtectedUser } from "@/stores/user-store";
import {
  updateUserSchema,
  USER_ROLES,
  USER_STATUSES,
  type UpdateUserFormValues,
} from "@/lib/validators/user";
import type { UserAccount } from "@/lib/types/user";

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

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const users = useUserStore((s) => s.users);
  // TODO: Replace with backend API endpoint — PATCH /api/v1/users/:id
  const updateUser = useUserStore((s) => s.updateUser);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<UpdateUserFormValues | null>(
    null,
  );

  // Find the user from store
  const user: UserAccount | undefined = users.find((u) => u.id === params.id);

  // Track initial values for change detection
  const initialValuesRef = useRef<{ role: string; status: string } | null>(
    null,
  );
  const hasResetRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      role: undefined,
      status: undefined,
      newPassword: "",
    },
  });

  // Watch role and status for confirmation dialog logic
  const watchedRole = useWatch({ control, name: "role" });
  const watchedStatus = useWatch({ control, name: "status" });

  // Pre-fill form when user data is available (safe from infinite re-render)
  useEffect(() => {
    if (user && !hasResetRef.current) {
      reset({
        name: user.name,
        role: user.role,
        status: user.status,
        newPassword: "",
      });
      initialValuesRef.current = { role: user.role, status: user.status };
      hasResetRef.current = true;
    }
  }, [user, reset]);

  // Handle form submission — check isDirty first, then role/status changes
  const onSubmit = (data: UpdateUserFormValues) => {
    // Guard: prevent submit if no changes were made
    if (!isDirty) {
      toast.info("Tidak ada perubahan untuk disimpan");
      return;
    }

    const initial = initialValuesRef.current;
    const roleChanged = initial && data.role !== initial.role;
    const statusChanged = initial && data.status !== initial.status;

    if (roleChanged || statusChanged) {
      // Show confirmation dialog before proceeding
      setPendingData(data);
      setShowConfirmDialog(true);
      return;
    }

    // No role/status change — submit directly
    executeUpdate(data);
  };

  // Execute the actual update
  // TODO: Replace with backend API endpoint — PATCH /api/v1/users/:id (with password hashing server-side)
  const executeUpdate = async (data: UpdateUserFormValues) => {
    setIsSubmitting(true);

    // Simulate 500ms loading delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    const error = updateUser(params.id, data);

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    toast.success("Pengguna berhasil diperbarui!");
    router.push("/dashboard/users");
  };

  // Handle confirmation dialog confirm
  const handleConfirmUpdate = () => {
    setShowConfirmDialog(false);
    if (pendingData) {
      executeUpdate(pendingData);
      setPendingData(null);
    }
  };

  // Handle confirmation dialog cancel
  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  // Build confirmation message
  const getConfirmMessage = (): string => {
    const initial = initialValuesRef.current;
    if (!initial || !pendingData) return "";

    const changes: string[] = [];
    if (pendingData.role !== initial.role) {
      changes.push(
        `Role: ${ROLE_LABELS[initial.role as keyof typeof ROLE_LABELS]} → ${ROLE_LABELS[pendingData.role as keyof typeof ROLE_LABELS]}`,
      );
    }
    if (pendingData.status !== initial.status) {
      changes.push(
        `Status: ${STATUS_LABELS[initial.status as keyof typeof STATUS_LABELS]} → ${STATUS_LABELS[pendingData.status as keyof typeof STATUS_LABELS]}`,
      );
    }
    return changes.join(", ");
  };

  // User not found state
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Pengguna Tidak Ditemukan</h1>
        </div>
        <p className="text-muted-foreground">
          Data pengguna dengan ID tersebut tidak ditemukan di sistem.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/users")}
        >
          Kembali ke Daftar Pengguna
        </Button>
      </div>
    );
  }

  // Protected user guard — redirect back with info toast
  if (isProtectedUser(user)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        </div>
        <p className="text-muted-foreground">
          Pengguna ini dilindungi dan tidak dapat diedit melalui antarmuka ini.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/users")}
        >
          Kembali ke Daftar Pengguna
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <UserCog className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Edit Pengguna</h1>
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

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted cursor-not-allowed"
            aria-describedby="email-hint"
          />
          <p id="email-hint" className="text-xs text-muted-foreground">
            Email tidak dapat diubah karena merupakan identifier unik.
          </p>
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
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
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

        <Separator />

        {/* Kata Sandi Baru (optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">
            Kata Sandi Baru{" "}
            <span className="text-muted-foreground font-normal">
              (opsional)
            </span>
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="pr-10"
              {...register("newPassword")}
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword ? "password-error" : "password-hint"
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
          {errors.newPassword ? (
            <p id="password-error" className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          ) : (
            <p id="password-hint" className="text-xs text-muted-foreground">
              Jika diisi: minimal 8 karakter, mengandung huruf besar &amp;
              angka. Kosongkan jika tidak ingin mengubah kata sandi.
            </p>
          )}
        </div>

        <Separator />

        {/* Submit buttons */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
          >
            Batal
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog for Role/Status change */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCancelConfirm();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Konfirmasi Perubahan</DialogTitle>
            <DialogDescription>
              Anda akan mengubah data berikut untuk pengguna{" "}
              <strong>{user.name}</strong>:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{getConfirmMessage()}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirm}>
              Batal
            </Button>
            <Button onClick={handleConfirmUpdate}>Ya, Lanjutkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
