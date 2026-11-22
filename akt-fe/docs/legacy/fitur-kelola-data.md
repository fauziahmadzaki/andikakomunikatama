# Fitur "Kelola Data" — e-Billing System V.3.0

Dokumen hasil observasi **read-only** terhadap aplikasi e-Billing milik PT. ANDIKA KOMUNIKA TAMA.

| Item | Nilai |
|---|---|
| Base URL | `https://e.ebilling.id:2053/billing/` |
| Halaman login | `login.php` (POST: `account`, `username`, `password`, `titik_lokasi`) |
| Akun observasi | `6121` — role **Administrator** |
| Tanggal eksplorasi | 21 Oktober 2026 |
| Metode | Semua halaman diambil via **HTTP GET** (fetch di dalam sesi browser yang sudah login). Tidak ada form yang di-submit, tidak ada data yang dibuat/diubah/dihapus. |
| Cakupan | Menu sidebar **Kelola Data** (22 item) |

---

## 1. Ringkasan

Menu **Kelola Data** adalah pusat master data aplikasi. Isinya 22 halaman yang bisa dikelompokkan menjadi:

| Kelompok | Item |
|---|---|
| **Pelanggan** | Data Pelanggan, Data Pelanggan Tidak Aktif, Data Pelanggan Corporate, Data Kartu Member, Data Installasi Pelanggan, Import Data Pelanggan |
| **Diskon & Deposit** | Data Diskon (5 varian input), Data Deposit Pelanggan |
| **Jaringan / Aset** | Data Router, Data GenieACS, Monitoring OLT, Data Tunnel, Data Antena, Data ODP/ODC/OLT, Data Tiang, Inventaris Perangkat |
| **Referensi & Keuangan** | Data Lokasi, Data Perusahaan, Data Tipe Pembayaran, Data Rekening |
| **Notifikasi & Integrasi** | Data Notifikasi, Data Mail Server |
| **Eksternal** | OLT ZTE (`https://oltzte.ebilling.id:2053/`) |

Pola umum semua halaman: `/billing/?page=<slug>` → tabel DataTables + tombol aksi; form tambah/edit berada di `?page=add-*` dan `?page=edit-*` dengan `method="post"` ke halaman itu sendiri.

Data aktual saat observasi: **67 pelanggan**, 4 lokasi, 3 router, 13 tipe pembayaran, 15 template notifikasi, 2 data diskon, 0 deposit.

---

## 2. Fingerprint teknis

| Aspek | Temuan |
|---|---|
| Web server | Apache/2.4.54 (Win64) |
| Runtime | **PHP 7.4.30** (sudah EOL sejak Nov 2022) + OpenSSL 1.1.1p |
| UI | AdminLTE 3, Bootstrap 4, jQuery, DataTables, Font Awesome |
| Session | Cookie `PHPSESSID`, `Max-Age=86400`, **tanpa flag `HttpOnly`/`Secure`/`SameSite`** |
| Proteksi CSRF | **Tidak ada** token di form login maupun form CRUD |
| Pola routing | Query string `?page=<slug>`, bukan REST |
| Pola form | `action=""` (self-POST) + redirect setelah simpan |
| ID pada URL | Di-*encode* base64, mis. `kode=MTA2Mjk2` → `106296`, `kode=ODg4Ng==` → `8886`. Obfuscation, bukan otorisasi |
| Pencarian data | AJAX ke `do.php?format=scr&awal=..&akhir=..&cari=..` |
| Export | Script terpisah di luar folder billing: `/export/*.php`, `/notifikasi/*.php`, `/billing/admin/ipl/*.php`, membawa parameter `data_account`, `data_lokasi`, `data_level` |
| Masking nominal | Angka uang di dashboard ditampilkan `Rp. ***.***` (server-side), dibuka lewat toggle mata |
| IP server | `118.99.126.183` ditulis di HTML login dengan `opacity: 0` |

---

## 3. Detail per halaman

### 3.1 Data Pelanggan — `?page=data-warga`

Judul: **Data Seluruh Pelanggan**. Sumber data utama (67 record).

**Kolom tabel (24):** No, Aksi, ID Pelanggan, Nama Pelanggan, Alamat, Titik Kordinat, Tlp, Email, No ID Identitas, Nama Langganan, Keterangan, Harga, Kode Unik, Pembayaran Terakhir, Nama Lokasi, Nama Router, Jenis Koneksi, Status Langganan, Username, Password, Nama Onu, Tanggal Registrasi, Tanggal Jatuh Tempo, Nama Sales.

**Filter:** `filter` (teks, required), `id_lokasi`, `id_router`, `id_tipe_pembayaran`, `jatuh_tempo`.

**Aksi massal (dalam satu form POST):**
- Pilih / Nonaktifkan Data
- Bayar Sekarang
- Checklist Semua / Unchecklist Semua
- Atur Kolom, Ringkas (mode tampilan)
- Reset
- **Update KTP**, **Implementasi**, **Kode Unik**, **Update PPN 11%**, **Migrasi Sales**, **Migrasi Tempo** — tombol utilitas massal
- Export Excel → `https://e.ebilling.id/export/data_pelanggan_admin.php?data_account=26032&data_lokasi=18051`

**Halaman turunan:** `?page=add-warga` (tambah), `?page=data-pelanggan-tidak-aktif` (arsip nonaktif).

#### Form Tambah Pelanggan (`?page=add-warga`) — 67 field

Form terbesar di aplikasi. Field dikelompokkan menurut fungsi aslinya:

**Identitas pelanggan**
`jns_pelanggan` (select, required: Pelanggan Lama / Pelanggan Baru / Pelanggan Survey) ·
`id pelanggan` (text, *nama field mengandung spasi*) ·
`nama_warga` (text, required) ·
`id_lokasi` (select, required) ·
`tlp` (number, required) · `tlp2` (number) · `email` (email) ·
`nik` (number) · `foto_ktp` (file)

**Alamat**
`alamat` (textarea, required) · `nomor_rumah` · `blok` · `dusun` · `kelurahan` · `kecamatan` ·
`titik_lokasi` (text, "Titik Map Lokasi" — koordinat peta)

**Konfigurasi jaringan (bagian terbesar)**
- Router & koneksi: `id_router`, `status_koneksi`, `jns_koneksi` (Dynamic / Static / PPPOE / Hotspot / IPBiddings), `metode_pembuatan` (Buat Baru / Sinkronisasi / Manual)
- Multi-router: `id_router1`, `id_router11`, `id_router2`, `id_router3`, `id_router4`, `id_router5`, `id_router6` (7 slot router)
- PPPoE/secret: `server_binding`, `profile`, `usersecret`, `password_secret`, `local_address`, `remote_address`, `usersecret2`
- QoS/queue: `nama_queues`, `nama_queues4`, `target_ip`, `max_upload_download`, `burst_limit`, `burst_threshold_limit`, `limit_download_upload`, `priority`, `bucket_size`, `parent`
- Hotspot: `profilhotspot`, `nama_userhotspot`, `password_hotspot`, `nama_hotspot`
- OLT/ONU: `nama_onu`, `provinsi` (dipakai sebagai **MAC Address**), `modul_olt`, `olt_port`, `index_onu`, `sn_onu`
- `catatan` (textarea)

**Langganan & billing**
`id_tipe_pembayaran` (select, required) · `prorate` (YA/Tidak) · `jns_blokir` (Manual/Otomatis) ·
`tgl_registrasi` (date, required) · `tgl_jatuh_tempo` (select 1–32, required) ·
`ppn` (YA / Tidak Ada, required) · `lain-lain` (add-on opsional) ·
`metode_insentif` (Presentase/Nominal) · `insentif_sales` · `id_sales` (required) ·
`status` (Aktif / Tidak Aktif, required)

> Catatan: banyak field jaringan tampil **kondisional** (bergantung `jns_koneksi`/`metode_pembuatan`), sehingga walau 67 field ada di DOM, tidak semua terlihat sekaligus.

---

### 3.2 Data Diskon — `?page=data-diskon`

**Kolom:** No, ID Pelanggan, Nama Pelanggan, Alamat, Nama Lokasi, Nama Langganan, Harga Paket, Keterangan, Nama Diskon, Metode Diskon, Nominal Diskon, Harga Setelah Diskon, Aksi.

**Lima jalur input diskon** (semua POST ke halaman masing-masing):

| Halaman | Cakupan | Field |
|---|---|---|
| `?page=add-diskon` | Pilih pelanggan dulu (picker, AJAX `do.php`) | — |
| `?page=add-diskon-semua` | Semua pelanggan | `nama_diskon`, `metode_insentif` (Presentase/Nominal), `insentif_sales` |
| `?page=add-diskon-lokasi` | Per lokasi | idem + `id_lokasi` (required) |
| `?page=add-diskon-paket` | Per paket | idem + `id_tipe_pembayaran` (required) |
| `?page=add-diskon-paket-lokasi` | Per paket + lokasi | idem + `id_tipe_pembayaran`, `id_lokasi` |

**Aksi lain:** Hapus Data Diskon Semua Pelanggan, Hapus Data Terpilih, Export (`/export/data_diskon.php`).

---

### 3.3 Data Deposit Pelanggan — `?page=data-deposit-pelanggan`

**Kolom:** No, ID Pelanggan, Nama Pelanggan, Nama Sales, Nama Pembayaran, Nominal Harus Dibayar, Nominal Pembayaran, Status Pembayaran, Alamat, Tlp, Bukti Pembayaran, Periode Pembayaran, Metode Pembayaran, Waktu Entry, Keterangan, Cetak, Aksi.

**Filter periode:** `tgl1` + `tgl2` (date, required) dengan tombol `Simpan`, `Download`, `Kirim`.

**Alur tambah:** `?page=add-deposit-pelanggan&kode=1` → halaman **"Pilih Pelanggan Yang Akan Deposit"** (tabel dengan kolom sama seperti data pelanggan) → baru masuk form deposit.

Catatan: 0 record saat observasi.

---

### 3.4 Data Kartu Member — `?page=data-kartu-warga`

**Kolom:** Aksi, ID Pelanggan, Nama Pelanggan, Alamat, Tlp, **Username**, **Password**, No ID Identitas, Nama Langganan, Keterangan, Harga, Catatan, Tanggal Registrasi, Tanggal Jatuh Tempo.

Fungsi: kartu/member card pelanggan (link publik via tombol **Copy Link**). Password akun pelanggan ditampilkan dalam bentuk teks di tabel.

---

### 3.5 Data Lokasi — `?page=data-lokasi`

**Kolom:** No, Nama Lokasi, Alamat, Tlp, Metode Insentif, Insentif, ID Group, Jumlah Pelanggan, Aksi. (4 lokasi)

**Form tambah** (`?page=add-lokasi`, 6 field):
`nama_lokasi` (req) · `alamat_lokasi` (textarea, req) · `tlp_lokasi` · `metode_insentif` (Presentase/Nominal) · `insentif_sales` · `group_wa`

---

### 3.6 Data Perusahaan — `?page=data-perusahaan`

Halaman profil ISP (1 record). Tidak punya tombol tambah; hanya edit via `?page=edit-perusahaan&kode=ODg4Ng==`.

**Kolom:** Aksi, No, Nama Perusahaan, Supported By, Logo Perusahaan, Logo Support, Keterangan Usaha, Alamat, Tlp, Email, Nama Perwakilan, TTD Perwakilan, Jabatan, Pengaturan Tagihan, Periode Tagihan, ID Group WA Ticket, ID Group Telegram Ticket, ID Group WA Monitoring, ID Group Telegram Monitoring, QR Registrasi Mandiri, BHP, USO, Fee ISP.

**Form edit (26 field):** `id_lokasi`, `nama_lokasi`, `power_by`, `keterangan_lokasi` (req), `alamat_lokasi` (req), `tlp_lokasi`, `email`, `nama_perwakilan`, `jabatan`, `tagihan` (req), `periode` (req), `group_wa`, `id_telegram_ticket`, `group_realtime_monitoring`, `id_telegram_monitoring`, `token_telegram`, `logo_usaha` (file), `logo_isp` (file), `ttd_perusahaan` (file), `bhp`, `nominal_bhp`, `uso`, `nominal_uso`, `metode_fee`, `nominal_fee`.

---

### 3.7 Data Tipe Pembayaran — `?page=data-tipe-pembayaran`

Daftar paket/langganan (13 record).

**Kolom:** No, Nama Tipe, Ketarangan Tipe *(salah tulis di aplikasi asli)*, Harga, Jenis Pembayaran, Profile, Tampil Halaman Registrasi, Lokasi, Filter Lokasi, Jumlah Pelanggan, Aksi.

**Form tambah (16 field):** `nama_tipe` (req), `keterangan` (req), `harga` (number, req), `jns_tipe_pembayaran` (Wajib / Tidak Wajib Tiap Bulan, req), `id_lokasi`, `buat_profile` (Ya/Tidak), `jns_koneksi` (PPPOE/Hotspot), `id_router`, `status_koneksi`, `buat_pool` (Ya/Tidak), `nama_pool`, `local_address`, `remote_address`, `remote_address1` (select pool), `profile`, `filter_lokasi` (req).

**Form edit (10 field):** `nama_tipe`, `keterangan_tipe`, `harga`, `jns_tipe_pembayaran`, `id_lokasi`, `profile`, `registrasi`, `ubah1`, `ubahppn`, `filter_lokasi` → semua required.

**Aksi khusus:** Migrasi Tipe Pembayaran.

---

### 3.8 Data Notifikasi — `?page=data-notifikasi`

15 template notifikasi (WhatsApp/push).

**Kolom:** No, Nama Notifikasi, Tgl Mengingatkan, Wkt Mengingatkan, Tipe Mengingatkan, Pelanggan Yg Diingatkan, Tampilkan Link, Aksi.

**Form edit** (`?page=edit-notifikasi&kode=<base64-id>`, 4 field): `nama_notifikasi`, `header` (textarea), `footer` (textarea), `link` (select). Isi body memakai placeholder `*MURANET*` dsb.

**Terkait:** `?page=setting-push-notifikasi` (toggle on/off via radio `push_notif`).

---

### 3.9 Data Mail Server — `?page=edit-mail-server`

Bukan tabel, langsung form konfigurasi SMTP (1 record).

**Field:** `id_mail_server` (text), `email_address` (email), `pass` (password), `enkripsi` (select), `smtp` (text), `port` (number), `status` (select), tombol `Ubah`.

Password SMTP disimpan/ditampilkan lewat form biasa (tanpa indikasi enkripsi di sisi klien).

---

### 3.10 Data Router — `?page=data-router`

**Kolom:** No, Nama Router, Ip Address, Lokasi, Jumlah Pelanggan, Cek Koneksi, Aksi. (3 router: AKT-BATU, AKT_WOODVILLE, AKT_GREENPARK)

**Form tambah (5 field):** `nama_router` (req), `ip_address` (req, format `ip:portapi`), `username` (req), `password` (password, req), `id_lokasi` (req).

Integrasi: MikroTik RouterOS API (terlihat dari istilah secret, profile, queue, pool, hotspot).

---

### 3.11 Data GenieACS — `?page=data-genieacs-server`

**Kolom:** No, Nama genieacs, Ip Address, Aksi.

**Form tambah (2 field):** `nama_genieacs` (req), `ip_address` (req).

Integrasi: ACS TR-069 untuk manajemen ONU/CPE.

---

### 3.12 Monitoring OLT — `?page=data-olt-new`

Halaman besar, terdiri dari 4 blok:

1. **Data OLT** — kolom: No, Nama OLT, Nama Lokasi, Host, Vendor / Model, Port Akses, SNMP, Status Akses, Status SNMP, Aksi
2. **Vendor / Model OLT** — form (`Simpan Vendor / Model`)
3. **Environment Monitoring OLT** — kolom: Sensor, Type, Status, Current, Minimum, Maximum, Average, Terakhir; filter 24 Jam / 7 Hari / 30 Hari; tombol Refresh Grafik, Ambil Data Sekarang, Ambil Snapshot Graph
4. **OLT Configurations** — tab OLT / Uplink / PON

**Tambah OLT** (`?page=add-olt-new`, 11 field): `nama_olt` (req), `id_lokasi` (req), `vendor` (req: ZTE / HUAWEI / HSGQ / HIOSO / C-DATA), `model` (req), `host` (req), `port_telnet` (number, req), `username_telnet` (req), `password_telnet` (password, req), `port_snmp`, `snmp_community`, `snmp_version` (2c / 1).

Ada juga halaman eksternal terpisah: `https://oltzte.ebilling.id:2053/`.

---

### 3.13 Data Tunnel — `?page=data-tunnel`

**Kolom:** No, Nama Tunnel, User, Aksi.
**Form tambah (1 field):** `nama_tunnel` (req).

---

### 3.14 Data Antena — `?page=data-antena`

**Kolom:** Aksi, No, MAC, IP Address, SSID, **Password**, Freq, Channel, Lokasi, Keterangan.
**Form tambah (8 field, semua required):** `mac`, `ip`, `ssid`, `password`, `freq`, `channel`, `lokasi` (textarea), `keterangan` (textarea).
Export: `/billing/admin/antena/data_antena2.php?&data_account=6121`.

---

### 3.15 Data Installasi ODP ODC OLT — `?page=data-odp`

**Kolom:** Aksi, No, ID, Jenis Perangkat, Nama, Merek / Model, SN, Lokasi, Maximal Jml Pelanggan, Jml Pelanggan Saat Ini, Kapasitas Yang Tersisa Saat Ini, Keterangan, Tersambung Ke OLT, Tersambung Ke ODC, Tersambung ke Port ODC Berapa?, Keterangan Port / Warna Kabel, Port Koneksi 1, Keterangan Koneksi 1, Port Koneksi 2, Keterangan Koneksi 2.

**Form tambah (18 field):** `jns_perangkat` (req), `id_odc`, `pilih_port`, `warna_kabel`, `port1`, `keterangan1`, `port2`, `keterangan2`, `id_olt`, `id_tiang`, `nama_odp` (req), `model_odp` (req), `sn_odp` (req), `lokasi_odp` (textarea, req), `titik_lokasi`, `foto_lokasi` (file), `max_pelanggan` (number), `keterangan` (textarea, req).

---

### 3.16 Data Tiang — `?page=data-tiang`

**Kolom:** Aksi, No, Nama Tiang, Titik Koordinat, Nama Lokasi, Foto.
**Form tambah (5 field):** `kode_tiang`, `nama_tiang`, `titik_lokasi`, `lokasi_tiang` (textarea), `foto_tiang` (file).
**Import:** `?page=data-import-tiang` (`account` number req + `filexls`).
Export: `/export/data_tiang.php?&data_account=6121&data_level=Administrator`.

---

### 3.17 Data Inventaris Perangkat — `?page=dashboard-perangkat`

Judul: **Dashboard Inventaris**. Bukan master data, melainkan riwayat pergerakan stok.
**Kolom:** Waktu, Referensi, Transaksi, Barang, Qty, Status.

---

### 3.18 Data Installasi Pelanggan — `?page=data-installasi`

**Kolom:** No, Aksi, ID Pelanggan, Nama Pelanggan, Alamat, Tlp, No ID Identitas, Nama Langganan, Keterangan, Harga, Nama OLT, Nama ODP, Nama ODC.
**Filter:** `account` (text, pencarian per ID pelanggan).
Tidak ada tombol tambah (data terbentuk dari data pelanggan + ODP/OLT). Export: `/export/data_pelanggan_installasi.php`.

---

### 3.19 Data Rekening — `?page=data-rekening`

**Kolom:** No, Nama Rekening, Atas Nama, No Rekening, Tampil Di Invoice Broadband, Tampil Di Invoice Corporate, Aksi.
**Form tambah (5 field):** `nama_rekening` (req), `atas_nama` (req), `no_rekening` (req), `invoice` (Ya/Tidak, req), `invoice_corporate` (Ya/Tidak, req).

---

### 3.20 Import Data Pelanggan — `?page=import-excel`

Form: `account` (number, req) + `filexls` (file) + tombol `Simpan`. Import massal pelanggan dari Excel.

---

### 3.21 Data Pelanggan Corporate — `?page=dashboard-corporate`

Saat diakses mengembalikan halaman **kosong** (tidak ada heading, tabel, form, maupun iframe). Kemungkinan: modul corporate belum aktif untuk akun ini, atau konten dimuat lewat komponen yang tidak ter-render.

---

### 3.22 OLT ZTE (eksternal)

Link keluar ke `https://oltzte.ebilling.id:2053/` — aplikasi terpisah, tidak diperiksa.

---

## 4. Pola teknis penting (untuk klon)

1. **Routing query-string**: `?page=<slug>` dengan slug tidak konsisten (`data-warga` = pelanggan, `data-olt-new`, `dashboard-perusahaan`). Kalau dibangun ulang, ini yang pertama harus dirapikan.
2. **ID di URL di-base64** (`kode=`) — tidak ada otorisasi per-record; hanya obfuscation. Rawan IDOR.
3. **Tidak ada CSRF token** di seluruh form CRUD. Klon wajib menambahkan CSRF + `SameSite` cookie.
4. **Password disimpan/ditampilkan plaintext** di beberapa tempat: kolom Password pada Data Kartu Member, Data Antena, serta form Router/OLT (`password_telnet`), Mail Server. Ini harus di-hash/secret-store pada klon.
5. **Export keluar dari folder aplikasi** (`/export/*.php`) dan membawa `data_account`/`data_lokasi` di query string — endpoint terpisah dari sesi halaman, perlu diaudit.
6. **Nama field mengandung spasi** (`id pelanggan`) dan singkatan tidak konsisten (`jns_`, `tlp`, `telp`) → perlu normalisasi skema.
7. **Soft delete via status** (`status` Aktif/Tidak Aktif + halaman "Data Tidak Aktif"), bukan hapus fisik.
8. **Banyak field jaringan kondisional** dalam satu form raksasa (67 field) — indikasi validasi & state management dilakukan di server secara ad-hoc.
9. **DataTables + AJAX `do.php`** untuk pencarian; nomor besar (ratusan pelanggan) sudah dipikirkan lewat paging server-side.
10. **Masking nominal** hanya di dashboard (`Rp. ***`), sedangkan tabel data menampilkan angka apa adanya.

---

## 5. Relasi entitas yang bisa disimpulkan

```
perusahaan (1)
  └── lokasi (4)  ──┬── router (3) ──┬── pelanggan (67)
                    │                └── tipe_pembayaran (13)
                    ├── tipe_pembayaran
                    └── insentif / group_wa

pelanggan (67)
  ├── id_lokasi      → lokasi
  ├── id_router      → router
  ├── id_tipe_pembayaran → tipe_pembayaran
  ├── id_sales       → user (sales/teknisi)
  ├── jns_koneksi    → Dynamic | Static | PPPOE | Hotspot | IPBiddings
  ├── ODP/OLT/ONU    → data-odp, data-olt-new, genieacs
  └── diskon (0..n)  → data-diskon
      deposit (0..n) → data-deposit-pelanggan

data-odp (ODP/ODC/OLT)
  ├── id_olt   → OLT
  ├── id_odc   → ODC (self-reference jenis perangkat)
  └── id_tiang → tiang

notifikasi (15 template) ← tipe & waktu pengingat
rekening (n) → tampil di invoice broadband / corporate
```

Entitas pendukung lain yang terlihat tapi tidak dieksplorasi: `sales`, `user`, `ticket`, `voucher`, `transaksi`, `finance`, `laporan`, `payment gateway`, `ppob`.

---

## 6. Rekomendasi untuk aplikasi klon

**Skema & data**
- Pisahkan master data: `customers`, `subscriptions`, `packages`, `locations`, `routers`, `olts`, `odps`, `odcs`, `poles`, `discounts`, `deposits`, `bank_accounts`, `notification_templates`.
- Ganti field jaringan yang menumpuk di `customers` (67 field) menjadi tabel `customer_network_config` + `pppoe_secrets` + `hotspot_users` + `onu_bindings`.
- Simpan kredensial perangkat (router/OLT/ACS/SMTP) di secret store (Vault/env terenkripsi), bukan kolom DB biasa.

**Keamanan**
- CSRF token per form, cookie `HttpOnly; Secure; SameSite=Lax`.
- Ganti `?page=` + `kode=base64` dengan route eksplisit + policy/authorization per resource.
- Password pelanggan: hash (bcrypt/argon2); tampilkan sekali saat pembuatan saja.
- Rate limit login + audit log semua aksi mutasi (aplikasi asli belum punya).
- Upgrade dari PHP 7.4 (EOL) ke 8.3+ bila tetap memakai PHP.

**Fungsional yang wajib ada di klon (urutan prioritas)**
1. CRUD pelanggan + provisioning (PPPoE/Hotspot/Static) + mapping ke router
2. CRUD paket/tipe pembayaran + prorate + PPN
3. Tagihan, pembayaran, deposit, diskon
4. Data aset jaringan: lokasi → router → ODP/ODC/OLT → tiang → antena
5. Notifikasi (template + jadwal + push/WA)
6. Import/export Excel
7. Kartu member / QR registrasi mandiri

---

## 7. Lampiran — daftar endpoint yang ditemukan

### Halaman daftar
```
?page=data-warga                    ?page=data-pelanggan-tidak-aktif
?page=data-diskon                   ?page=data-deposit-pelanggan
?page=dashboard-corporate           ?page=data-kartu-warga
?page=data-lokasi                   ?page=data-perusahaan
?page=data-tipe-pembayaran          ?page=data-notifikasi
?page=edit-mail-server              ?page=data-router
?page=data-genieacs-server          ?page=data-olt-new
?page=data-tunnel                   ?page=data-antena
?page=data-odp                      ?page=data-tiang
?page=dashboard-perangkat           ?page=data-installasi
?page=data-rekening                 ?page=import-excel
?page=data-import-tiang
```

### Form tambah
```
?page=add-warga                     ?page=add-diskon
?page=add-diskon-semua              ?page=add-diskon-lokasi
?page=add-diskon-paket              ?page=add-diskon-paket-lokasi
?page=add-deposit-pelanggan&kode=1  ?page=add-lokasi
?page=add-tipe-pembayaran           ?page=add-router
?page=add-genieacs-server           ?page=add-olt-new
?page=add-tunnel                    ?page=add-antena
?page=add-odp                       ?page=add-tiang
?page=add-rekening
```

### Form edit
```
?page=edit-perusahaan&kode=<b64>    ?page=edit-tipe-pembayaran&kode=<b64>
?page=edit-notifikasi&kode=<b64>    ?page=edit-mail-server
```

### Endpoint non-`?page=`
```
do.php?format=scr&awal=&akhir=&cari=            (AJAX pencarian pelanggan)
/export/data_pelanggan_admin.php?data_account=&data_lokasi=
/export/data_diskon.php
/export/data_odp_odc_olt.php
/export/data_tiang.php
/export/data_pelanggan_installasi.php
/billing/admin/antena/data_antena2.php
/notifikasi/update_moota.php?account=
?page=setting-push-notifikasi
https://api-service.ebilling.id/docs/api#/     (dokumentasi API pihak aplikasi)
https://oltzte.ebilling.id:2053/               (aplikasi OLT terpisah)
```

---

*Dokumen ini dibuat dari observasi GET saja. Tidak ada form yang di-submit dan tidak ada data yang dimodifikasi. Kredensial login tidak disimpan di dalam dokumen ini.*
