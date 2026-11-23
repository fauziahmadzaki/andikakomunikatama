# AKT Management & SLA Monitoring System (Monorepo)

Sistem Informasi Manajemen Jaringan, Pengelolaan Router MikroTik, dan Pemantauan SLA Real-time berbasis probe **MikroTik Netwatch** dengan visualisasi bar horizontal **Uptime Kuma** (30 menit) serta integrasi **Telegram Alerting** & **Real-time Web Push Notification (SSE)**.

---

## 🏗 Struktur Proyek Monorepo

```
akt/
├── docker-compose.yml       # Orkestrasi Docker (Database, Backend, Frontend)
├── .env.example             # Template konfigurasi environment
├── README.md                # Dokumentasi instalasi dan penggunaan
├── akt-be/                  # Backend REST API (Node.js, Express, TypeScript, Drizzle ORM)
│   ├── Dockerfile
│   └── src/
└── akt-fe/                  # Frontend Dashboard (Next.js 16, React 19, Tailwind CSS)
    ├── Dockerfile
    └── src/
```

---

## 🚀 Cara Menjalankan dengan Docker (Rekomendasi)

### 1. Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terpasang dan berjalan di komputer Anda.

### 2. Jalankan Seluruh Sistem (Database + Backend + Frontend)
Buka terminal di root folder `akt/`, lalu jalankan:

```bash
# Salin konfigurasi environment (opsional jika ingin mengubah default)
cp .env.example .env

# Jalankan seluruh service di latar belakang
docker compose up -d --build
```

Container yang akan berjalan:
- **Frontend Dashboard**: [http://localhost:3002](http://localhost:3002)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Database PostgreSQL**: Port `5432` (`akt_db`)

### 3. Hentikan Service
```bash
docker compose down
```

---

## 💻 Cara Menjalankan Secara Manual (Development Lokal)

### 1. Database PostgreSQL
Pastikan PostgreSQL berjalan di port 5432 dengan database `akt_db`.

### 2. Menjalankan Backend (`akt-be`)
```bash
cd akt-be
npm install
npx drizzle-kit push      # Push schema ke database
npm run dev               # Berjalan di port 5000
```

### 3. Menjalankan Frontend (`akt-fe`)
```bash
cd akt-fe
npm install
npm run dev               # Berjalan di port 3002
```

---

## 🔐 Kredensial Login Default

Database otomatis melakukan seeding user admin awal saat pertama kali dijalankan:

| Field | Nilai Default |
|---|---|
| **URL Login** | [http://localhost:3002/login](http://localhost:3002/login) |
| **Username** | `admin` (atau `admin@akt.net.id`) |
| **Password** | `admin123` |
| **Role** | `admin` (Akses Penuh) |

---

## 📱 Konfigurasi Telegram Alerting

Konfigurasi bot dan channel Telegram dikelola secara aman melalui antarmuka web:
- Masuk ke menu **Monitoring SLA** (`/dashboard/jaringan/sla`).
- Klik tombol **Alert Telegram**.
- Masukkan Bot Token dari @BotFather dan Chat ID penerima / grup.
- Tersedia tombol **Test** untuk memverifikasi koneksi seketika.
- Data tersimpan aman di database tanpa perlu disimpan di file konfigurasi publik atau `.env`.

---

## 📡 Fitur yang Tersedia (Branch `main`)

1. **Manajemen Router MikroTik** (`/dashboard/jaringan/router`)
   - Tambah, edit, dan pantau status koneksi router via RouterOS API (Port 8728).
   - Pengujian koneksi live router.
2. **Monitoring SLA Netwatch & Uptime Kuma** (`/dashboard/jaringan/sla`)
   - Otomatis membuat rule `/tool netwatch` di router MikroTik saat target ditambahkan (jika host sudah ada di Netwatch, proses penambahan dilewati untuk menghindari duplikasi).
   - Tipe target: Gateway, OLT, Switch, Server, Pelanggan PPPoE, Pelanggan Antena, Pelanggan Dedicated, dan lainnya.
   - Sinkronisasi massal seluruh pelanggan PPPoE aktif menjadi target monitoring (otomatis skip jika sudah ada).
   - Tampilan bar Uptime Kuma (30 menit terakhir hingga `now`) yang bergeser setiap 60 detik.
   - Notifikasi insiden DOWN dan pemulihan UP ke Telegram serta Web Push Notification (SSE).
3. **Pengelolaan Cabang** (`/dashboard/pengaturan/cabang`)
   - Manajemen kantor cabang dan alokasi router.
4. **Pengelolaan Pengguna** (`/dashboard/pengaturan/pengguna`)
   - Manajemen staf, teknisi, dan admin sistem.

*(Fitur modul lainnya seperti Keuangan, Tagihan, dan Tiket dilanjutkan pada branch `dev`).*
