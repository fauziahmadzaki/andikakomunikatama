# MURANET Design System (Sementara)

Dokumen ini hanya mendefinisikan **desain**: warna, tipografi, spacing, radius,
elevation, dan spesifikasi visual komponen. Aturan implementasi, struktur kode,
serta do & don't ada di [`AGENTS.md`](AGENTS.md).

> Status: sementara. Token sumber ada di [`src/app/globals.css`](src/app/globals.css).
> Nilai warna di CSS memakai `oklch()`; hex di dokumen ini adalah pendekatan visual.

---

## 1. Arah Visual

- Bersih, tenang, dan operasional.
- Biru sebagai identitas utama dan warna aksi.
- Merah sebagai penanda bahaya/destructive.
- Permukaan dominan netral cool-slate.
- Warna brand dipakai secukupnya; tidak ada gradient/glow besar sebagai latar utama.

---

## 2. Warna

### 2.1 Palet brand

| Token | Hex | Catatan visual |
|---|---|---|
| `--color-brand-blue-50` | `#EFF6FF` | surface hover / accent |
| `--color-brand-blue-100` | `#DBEAFE` | secondary surface |
| `--color-brand-blue-200` | `#BFDBFE` | border/aksen halus |
| `--color-brand-blue-300` | `#93C5FD` | teks di atas navy |
| `--color-brand-blue-400` | `#60A5FA` | primary dark mode |
| `--color-brand-blue-500` | `#2F86F6` | ring / fokus |
| `--color-brand-blue-600` | `#1568E0` | **primary** light mode |
| `--color-brand-blue-700` | `#1155BC` | teks biru / hover |
| `--color-brand-blue-800` | `#0F4699` | secondary foreground |
| `--color-brand-blue-900` | `#0E3B7D` | secondary dark mode |
| `--color-brand-blue-950` | `#08264F` | surface navy |

| Token | Hex | Catatan visual |
|---|---|---|
| `--color-brand-red-50` | `#FFF1F1` | background error halus |
| `--color-brand-red-100` | `#FFE0E0` | background error |
| `--color-brand-red-200` | `#FFC6C7` | border error halus |
| `--color-brand-red-300` | `#FF9EA0` | aksen logo di dark |
| `--color-brand-red-400` | `#FB6266` | destructive dark mode |
| `--color-brand-red-500` | `#ED2E35` | chart / aksen logo |
| `--color-brand-red-600` | `#D91E28` | **destructive** light mode |
| `--color-brand-red-700` | `#B71620` | hover destructive |
| `--color-brand-red-800` | `#97161F` | teks error |
| `--color-brand-red-900` | `#7D1820` | — |
| `--color-brand-red-950` | `#45060A` | — |

| Token | Hex | Catatan visual |
|---|---|---|
| `--color-brand-neutral-50` | `#F8FAFC` | background app |
| `--color-brand-neutral-100` | `#F1F5F9` | muted |
| `--color-brand-neutral-200` | `#E2E8F0` | border / input |
| `--color-brand-neutral-300` | `#CBD5E1` | — |
| `--color-brand-neutral-400` | `#94A3B8` | muted text dark |
| `--color-brand-neutral-500` | `#64748B` | muted foreground |
| `--color-brand-neutral-600` | `#475569` | sidebar dark text |
| `--color-brand-neutral-700` | `#334155` | teks sekunder |
| `--color-brand-neutral-800` | `#1E293B` | muted dark |
| `--color-brand-neutral-900` | `#0F172A` | foreground / card dark |
| `--color-brand-neutral-950` | `#020617` | background dark |

Alias: `--color-brand` → blue-600, `--color-brand-accent` → red-600.

### 2.2 Token semantic

| Token | Light | Dark | Peran visual |
|---|---|---|---|
| `background` | neutral-50 | neutral-950 | latar aplikasi |
| `foreground` | neutral-900 | neutral-50 | teks utama |
| `card` | white | neutral-900 | permukaan kartu |
| `card-foreground` | neutral-900 | neutral-50 | teks kartu |
| `popover` | white | neutral-900 | dropdown/popover |
| `primary` | blue-600 | blue-400 | aksi utama, state aktif |
| `primary-foreground` | white | neutral-950 | teks di atas primary |
| `secondary` | blue-100 | blue-900 | aksi sekunder halus |
| `secondary-foreground` | blue-800 | blue-100 | teks secondary |
| `muted` | neutral-100 | neutral-800 | surface netral |
| `muted-foreground` | neutral-500 | neutral-400 | teks sekunder |
| `accent` | blue-50 | blue-950 | hover/active halus |
| `accent-foreground` | blue-700 | blue-100 | teks accent |
| `destructive` | red-600 | red-400 | hapus/error/bahaya |
| `border` | neutral-200 | white 12% | garis |
| `input` | neutral-200 | white 16% | border input |
| `ring` | blue-500 | blue-400 | focus ring |
| `sidebar` | white | neutral-950 | permukaan sidebar |

### 2.3 Warna chart

| Token | Light | Dark |
|---|---|---|
| `chart-1` | blue-600 | blue-400 |
| `chart-2` | red-500 | red-400 |
| `chart-3` | blue-400 | blue-200 |
| `chart-4` | red-300 | red-300 |
| `chart-5` | neutral-400 | neutral-400 |

### 2.4 Pemetaan visual

- Aksi utama: biru primary + teks putih (light) / teks navy (dark).
- Aksi sekunder: permukaan biru muda.
- Hover/focus: accent biru sangat muda atau muted netral.
- Destructive: merah.
- Status sukses / tren naik: emerald `500/10` + `emerald-600` (dark: `emerald-400`).
- Status peringatan / terbuka: amber `500/10` + `amber-700` (dark: `amber-400`).
- Status proses: `primary/10` + `primary`.

---

## 3. Tipografi

Font utama: **Arial**.

```css
--font-sans: Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif;
--font-heading: Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

### 3.1 Skala display

| Utility | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `text-display` | 3.5rem / 56px | 1.05 | -0.03em | 700 |
| `text-title` | 2.25rem / 36px | 1.15 | -0.02em | 700 |
| `text-subtitle` | 1.25rem / 20px | 1.4 | -0.01em | 600 |

### 3.2 Heading dasar

| Elemen | Size |
|---|---|
| `h1` | `text-4xl` (36px) |
| `h2` | `text-3xl` (30px) |
| `h3` | `text-2xl` (24px) |
| `h4` | `text-xl` (20px) |
| `h5` | `text-lg` (18px) |
| `h6` | `text-base` (16px) |

Semua heading: `font-heading font-bold tracking-tight text-balance`.

### 3.3 Peran teks

- Judul halaman: `text-2xl font-bold tracking-tight`.
- Label kartu: `text-sm text-muted-foreground`.
- Angka KPI: `text-2xl font-bold tracking-tight`.
- Teks bantuan: `text-xs` atau `text-sm text-muted-foreground`.
- ID/angka teknis: `font-mono text-xs`.
- Judul panjang: `text-balance`; paragraf: `text-pretty`.

---

## 4. Spacing & Layout

Skala Tailwind 4 (basis 0.25rem / 4px).

| Konteks | Nilai |
|---|---|
| Padding halaman | `p-4 lg:p-6` |
| Padding isi card | `p-5` |
| Gap grid | `gap-4` |
| Jarak antar-section | `space-y-6` |
| Lebar konten dashboard | `max-w-[1400px]` |
| Sidebar | `w-64` (256px), collapsed `w-[72px]` |
| Tinggi topbar | `h-16` (64px) |
| Tinggi header sidebar | `h-14` (56px) |

---

## 5. Radius

Base `--radius: 0.75rem` (12px).

| Token | Nilai |
|---|---|
| `rounded-sm` | 7.2px |
| `rounded-md` | 9.6px |
| `rounded-lg` | 12px |
| `rounded-xl` | 16.8px |
| `rounded-2xl` | 21.6px |
| `rounded-3xl` | 26.4px |
| `rounded-4xl` | 31.2px |

Visual umum: card `rounded-xl`, tombol/input `rounded-lg`, badge/pill
`rounded-4xl` atau `rounded-full`.

---

## 6. Elevation & Motion

| Token | Nilai |
|---|---|
| `shadow-brand-sm` | `0 2px 8px -2px oklch(0.5439 0.1981 259.22 / 0.24)` |
| `shadow-brand` | `0 12px 32px -12px oklch(0.5439 0.1981 259.22 / 0.35)` |
| `ease-brand` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

Transisi standar: `transition-colors duration-200`. Sidebar:
`duration-200 ease-brand`.

---

## 7. Helper Brand

| Utility | Efek visual |
|---|---|
| `bg-brand-gradient` | gradient biru 135° (blue-400 → blue-600 → blue-800) |
| `bg-brand-gradient-accent` | gradient merah 135° |
| `text-brand-gradient` | teks bergradient biru |
| `text-brand-gradient-accent` | teks bergradient merah |

Untuk logo, hero, atau aksen kecil.

---

## 8. Spesifikasi Visual Komponen

### Button

| Size | Tinggi |
|---|---|
| `xs` | 24px |
| `sm` | 28px |
| `default` | 32px |
| `lg` | 36px |
| `icon` | 32×32px |

Variant visual: `default` (biru), `outline`, `secondary` (biru muda),
`ghost`, `destructive` (merah), `link`.

### Card

- Permukaan `bg-card`, `rounded-xl`, ring tipis `ring-foreground/10`.
- Isi data padat memakai `p-5`.

### Form

- Label: `text-sm font-medium`.
- Input default tinggi 32px, radius `rounded-lg`.
- Fokus: border `ring` + ring biru `ring-3`.
- Error: border `destructive`, teks error `text-destructive`.

### Badge status

- Pill ramping, teks kecil, background transparan berwarna.
- Sukses: emerald; peringatan: amber; proses: primary; bahaya: destructive.

### Sidebar

- Putih, border kanan, lebar 256px; collapsed 72px icon-only.
- Header 56px, item nav tinggi ±36px.
- Item aktif:
  - background `primary/10`
  - teks & ikon primary
  - indikator vertikal 3px, tinggi penuh item, rounded
  - posisi `-left-2` (gap 5px dari background)
- Item non-aktif: `text-muted-foreground`, hover `bg-muted`.

### Topbar

- Tinggi 64px, sticky, `bg-background/95 backdrop-blur`.
- Search: input dengan ikon kiri dan kbd `⌘K`.
- Aksi kanan: toggle tema, notifikasi, avatar inisial.

### Table

- Header `text-sm font-medium`, border bawah.
- Sel `p-2`, status memakai badge.
- Kolom pertama sebagai row header.

---

## 9. Dark Mode

- Diaktifkan dengan class `.dark` pada `<html>`.
- Primary: blue-400 dengan teks neutral-950.
- Secondary: blue-900 dengan teks blue-100.
- Destructive: red-400.
- Border: white 12%; input: white 16%.
- Permukaan: background neutral-950, card neutral-900.
