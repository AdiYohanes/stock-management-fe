# Stock Management System — Frontend

> ✅ **Save Point:** `v0.1.0-frontend-inventory-gr-draft`

Sistem manajemen stok gudang berbasis web untuk UMKM & warehouse kecil-menengah. Dibangun dengan prinsip **offline-first draft**, **role-based access**, dan **Indonesia-locale formatting**. Target user: Admin Gudang, Supervisor, Staff Operasional, dan Auditor.

- 📄 PRD: `/docs/PRD_Stock_Management_System.md`
- 🗄️ Backend: [stock-management-be](https://github.com/AdiYohanes/stock-management-be) (TBD)

---

## 🚀 Quick Start — Lanjut di Device Baru

```bash
# Clone repo
git clone https://github.com/AdiYohanes/stock-management-fe.git
cd stock-management-fe

# Install dependencies (gunakan npm ci untuk konsistensi)
npm ci

# Setup environment
cp .env.example .env.local
# Edit .env.local jika perlu (default sudah OK untuk lokal)

# Jalankan dev server
npm run dev

# Buka browser → http://localhost:3000
# Login mock: admin@demo.com / Demo123!
```

---

## 📦 Tech Stack

| Layer | Tech | Versi | Catatan |
|-------|------|-------|---------|
| Framework | Next.js | 14.x | App Router |
| Language | TypeScript | 5.x | strict mode, noImplicitAny |
| UI | shadcn/ui + Tailwind | 3.4 | Radix primitives, CSS variables |
| State | React Query + Zustand | v5 | Server state + UI state separation |
| Forms | React Hook Form + Zod | v7 + v3 | Shared validation schemas |
| Table | TanStack Table | v8 | Headless, server-side ready |
| HTTP | Axios | 1.x | Interceptors for JWT + refresh |

---

## ✅ Fitur yang Sudah Diimplementasi

### Inventory Master
- [x] Daftar produk: pagination, filter (kategori, status stok), sort (nama, stok, harga)
- [x] Create/Edit produk: dialog modal, Zod validation, error Bahasa Indonesia
- [x] Stock badge: hijau (>min), kuning (≤min), merah (=0)
- [x] Number formatting: `1.500.000`, `Rp 1.500.000`

### Goods Receipt (Receiving)
- [x] List GR: tabel dengan status badge (DRAFT/COMPLETED)
- [x] Detail GR: header info + item breakdown (read-only)
- [x] Create GR form: dynamic item rows, useFieldArray + Zod
- [x] Draft persistence: localStorage/Zustand, auto-load saat refresh

### Shared Infrastructure
- [x] Auth guard: redirect ke login jika tidak ada session
- [x] RBAC menu: sidebar sesuai role (Admin/Supervisor/Staff/Auditor)
- [x] Dashboard layout: responsive sidebar + header
- [x] Indonesia locale: format tanggal, timezone WIB, UI Bahasa Indonesia

---

## 🗂️ Folder Structure

```
src/
├── app/
│   ├── (auth)/login/              # Login page
│   ├── (dashboard)/               # Protected route group
│   │   ├── layout.tsx             # Sidebar + header + auth guard
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard summary
│   │       ├── inventory/
│   │       │   └── page.tsx       # Inventory list + CRUD
│   │       └── receiving/
│   │           ├── page.tsx       # List GR
│   │           ├── [id]/page.tsx  # Detail GR
│   │           └── new/page.tsx   # Create GR + draft
│   └── page.tsx                   # Root redirect
├── components/
│   ├── ui/                        # shadcn/ui base components
│   └── features/
│       ├── inventory/             # ProductTable, ProductDialog
│       └── receiving/             # GRItemRow
├── lib/
│   ├── api/                       # Axios client + endpoints
│   ├── validators/                # Zod schemas (shared FE/BE ready)
│   ├── formatters.ts              # Indonesia number/date formatting
│   ├── constants/                 # Mock data, menu config
│   └── types/                     # TypeScript interfaces
├── stores/                        # Zustand stores
│   ├── auth-store.ts
│   ├── product-filter-store.ts
│   └── receiving-draft-store.ts
└── hooks/
    └── use-debounce.ts
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run typecheck    # TypeScript strict check (tsc --noEmit)
```

---

## 🔐 Environment Variables

Buat `.env.local` dari template:

```bash
cp .env.example .env.local
```

| Variable | Default | Keterangan |
|----------|---------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | `Stock Management System` | Nama aplikasi |
| `NEXT_PUBLIC_APP_TIMEZONE` | `Asia/Jakarta` | Timezone default |

> ⚠️ **Jangan commit `.env.local` ke Git!** Gunakan `.env.example` sebagai template.

---

## 🔄 Git Workflow Multi-Device

```bash
# Sebelum pindah device: commit & push
git add .
git commit -m "feat: [deskripsi]"
git push origin main

# Di device baru: pull + install
git pull origin main
npm ci

# Fitur baru: gunakan branch
git checkout -b feature/nama-fitur
# ... coding ...
git push -u origin feature/nama-fitur
```

---

## 🚨 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Module not found: '@/...'` | Cek `tsconfig.json` → `paths: { "@/*": ["./src/*"] }` |
| `npm ci` gagal lockfile mismatch | Hapus `node_modules/` + `package-lock.json` → `npm install` → commit lockfile |
| Login mock tidak bekerja | Cek `src/lib/api/auth.ts` mock handler: `admin@demo.com / Demo123!` |
| Hot reload tidak update | Hapus `.next/` → restart `npm run dev` |
| `Cannot find module './vendor-chunks/...'` | Hapus `.next/` → restart dev server |

---

## 📌 Save Points

```
v0.1.0-frontend-inventory-gr-draft  ← CURRENT
  ✅ Inventory Master (CRUD + filter/sort/pagination)
  ✅ Receiving GR (List, Detail, Form + Draft)
  ✅ Auth guard, RBAC layout, Indonesia formatters

Next: v0.2.0 — GR Finalize + Stock Increment
```
