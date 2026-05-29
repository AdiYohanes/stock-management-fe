import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS } from "@/lib/constants/mock-users";
import type { UserAccount, UserStatus } from "@/lib/types/user";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from "@/lib/validators/user";

/** Protected user email — cannot be mutated via UI */
const PROTECTED_USER_EMAIL = "admin@demo.com";

/**
 * Check if a user is protected from mutation actions (toggle, disable, edit).
 * Protected users: email === "admin@demo.com" OR role === "ADMIN"
 */
export function isProtectedUser(
  user: Pick<UserAccount, "email" | "role">,
): boolean {
  return (
    user.email.toLowerCase() === PROTECTED_USER_EMAIL.toLowerCase() ||
    user.role === "ADMIN"
  );
}

/** Store state shape */
interface UserStoreState {
  users: UserAccount[];
}

/** Store actions */
interface UserStoreActions {
  /** Add a new user to the store. Returns error message if email is duplicate. */
  addUser: (data: CreateUserFormValues) => string | null;
  /** Update an existing user by ID. Returns error message if user not found. */
  updateUser: (id: string, data: UpdateUserFormValues) => string | null;
  /** Toggle user status between AKTIF and NONAKTIF */
  toggleUserStatus: (userId: string) => void;
  /** Disable (lock) a user — sets status to TERKUNCI */
  disableUser: (userId: string) => void;
  /** Enable a locked user — sets status back to AKTIF */
  enableUser: (userId: string) => void;
  /** Reset store to initial mock data */
  resetToMock: () => void;
}

type UserStore = UserStoreState & UserStoreActions;

/** Generate a simple unique ID for mock purposes */
function generateUserId(): string {
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,

      addUser: (data: CreateUserFormValues): string | null => {
        const { users } = get();

        // Check duplicate email
        const emailExists = users.some(
          (u) => u.email.toLowerCase() === data.email.toLowerCase(),
        );
        if (emailExists) {
          return "Email sudah terdaftar di sistem";
        }

        const now = new Date().toISOString();
        const newUser: UserAccount = {
          id: generateUserId(),
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          last_login: null,
          created_at: now,
          updated_at: now,
          activity_logs: [
            {
              id: `log-${Date.now()}`,
              action: "ACCOUNT_CREATED",
              timestamp: now,
              description: "Akun pengguna dibuat",
            },
          ],
        };

        set({ users: [newUser, ...users] });
        return null;
      },

      updateUser: (id: string, data: UpdateUserFormValues): string | null => {
        const { users } = get();
        const userIndex = users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
          return "Pengguna tidak ditemukan";
        }

        const now = new Date().toISOString();
        const existingUser = users[userIndex]!;

        const updatedUser: UserAccount = {
          id: existingUser.id,
          email: existingUser.email,
          last_login: existingUser.last_login,
          created_at: existingUser.created_at,
          name: data.name,
          role: data.role,
          status: data.status,
          updated_at: now,
          activity_logs: [
            {
              id: `log-${Date.now()}`,
              action: "ACCOUNT_UPDATED",
              timestamp: now,
              description: "Data pengguna diperbarui",
            },
            ...existingUser.activity_logs,
          ],
        };

        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        set({ users: updatedUsers });
        return null;
      },

      toggleUserStatus: (userId: string) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id !== userId) return user;
            const newStatus: UserStatus =
              user.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
            return {
              ...user,
              status: newStatus,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      disableUser: (userId: string) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id !== userId) return user;
            return {
              ...user,
              status: "TERKUNCI" as UserStatus,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      enableUser: (userId: string) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id !== userId) return user;
            return {
              ...user,
              status: "AKTIF" as UserStatus,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      resetToMock: () => {
        set({ users: MOCK_USERS });
      },
    }),
    {
      name: "users:local",
    },
  ),
);
