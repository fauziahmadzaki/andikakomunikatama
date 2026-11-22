# Verifikasi RBAC — 3 Role Diuji

Tanggal: 21 Oktober 2026 · Metode: **GET/observasi UI**, tanpa submit aksi apa pun.

## 1. Sumber akun

Menu **Users** (`?page=data-user`) menampilkan 6 akun. Form **Ubah User** (`?page=edit-user&kode=...`) mengisi field `username` **dan `password` dengan nilai asli (plaintext)**.

Artinya: siapa pun yang bisa membuka menu Users dapat membaca kredensial semua akun. Ini sudah cukup untuk uji role, tapi sekaligus temuan keamanan (lihat §4).

Akun yang tersedia:

| Akun | Level | Diuji |
|---|---|---|
| Administrator (9324) | Administrator | ✓ (baseline) |
| Prajnia Paramita Sulistiyanto | **CS** | ✓ |
| Dami Teknisi, BHAGUS PRATAMA, NURUDDIN HIDAYATULLAH, Fauzi Ahmad Zaki | **Teknisi** | ✓ (1 wakil) |

> Tidak ada akun Sales, HRD, Reseller, Mitra, atau NOC di daftar ini, sehingga role tersebut belum bisa diverifikasi.

Kredensial tidak disalin ke dokumen; tersimpan hanya di `_users.json` (lokal).

---

## 2. Menu yang benar-benar tampil

### Administrator (baseline)
14 grup: Dashboard (+8 sub), Income Summary, Kelola Data (22 item), Kelola Data Corporate, Poin Pelanggan, Apk Android, Management Mikrotik (5 item), Ticket, Voucher, Transaksi (13 item), Finance & Accounting (8 item), Laporan (16 item), Payment Gateway, Login API, Dokumentasi API, Setting, Users, Logs, Logout.

### CS (9 item)
```
Dashboard
Data Ticket Pelanggan
Data Genieacs
Data Ticket General
Pemasukan Lain Lain
Pengumuman
Monitoring OLT New
Users
Logout
```

### Teknisi (grup)
```
Dashboard
Dashboard Mapping
Kelola Data
  ├ Data Pelanggan
  ├ Data Installasi Pelanggan
  ├ Data Genieacs
  ├ Data Pekerjaan Harian
  ├ Data Antena
  ├ Data Installasi ODP ODC OLT
  └ Data Tiang
Data Ticket Pelanggan
Data Ticket General
Pengumuman
Status Langganan
Monitoring OLT New
Ticket
  └ Ticket (buat tiket)
Management Mikrotik
  ├ Data Session User PPPOE
  ├ Data User Static
  ├ Data User PPPOE
  ├ Data User Hotspot
  └ Data Session User Hotspot
Users
Logout
```

### Dashboard per role

| Role | Kartu yang tampil |
|---|---|
| Administrator | pelanggan, lunas/belum, tagihan & nominal, tiket, pemasukan/pengeluaran/balance, status langganan, WAGW |
| Teknisi | jumlah pelanggan, Scan Barcode, buat ticket, tiket closed/open/pending/dalam penanganan/aktivasi, jumlah langganan, status On/Off — **tanpa kartu uang** |
| CS | tidak direkam detail; menu jauh lebih sedikit |

---

## 3. Uji akses URL langsung (bypass menu)

`blank` = HTTP 200 tapi area konten kosong (tidak ada heading/form). `✓` = konten benar-benar dirender.

| Halaman | Administrator | CS | Teknisi |
|---|---|---|---|
| `?page=data-user` | ✓ (6 user) | ✓ heading "Data User" | ✓ heading "Data User" |
| `?page=add-user` | ✓ form 18 field | **blank** | **blank** |
| `?page=edit-user&kode=<admin>` | ✓ | **✓ form 22 field + password terisi** | belum diuji |
| `?page=add-warga` | ✓ form 67 field | **✓ form 66 field** | **blank** |
| `?page=data-warga` | ✓ | ✓ | ✓ |
| `?page=data-gaji-karyawan` | ✓ | **✓ heading payroll** | **✓ heading payroll** |
| `?page=data-log` | ✓ | ✓ heading | ✓ + form filter |
| `?page=data-ipl` | ✓ | blank | blank |
| `?page=data-pemasukan-validasi` | ✓ | ✓ heading | ✓ + form 7 field |
| `?page=data-diskon` | ✓ | ✓ | ✓ |
| `?page=data-perusahaan` | ✓ | ✓ | ✓ |
| `?page=data-router` | ✓ | ✓ | ✓ |
| `?page=finance-accounting-dashboard` | ✓ | **✓ "Rp 0"** | **✓ "Rp 0"** |
| `?page=data-olt-new` | ✓ | ✓ (HTML 236 KB) | ✓ |
| `?page=data-setting` | ✓ wizard | shell tanpa heading | shell tanpa heading |
| `?page=data-rekrut` (tidak ada) | blank | blank | blank |

> Catatan: tabel memakai DataTables **server-side**, jadi jumlah baris pada HTML awal bukan indikator isi data. Yang terbukti adalah **struktur halaman & form** terbuka; apakah endpoint AJAX-nya juga meloloskan data belum diuji (tidak dilakukan agar tidak menarik data masif).

---

## 4. Temuan

### K-1 (KRITIS) — CS dapat membaca password Administrator
Sebagai CS, `?page=edit-user&kode=MTk5Ng==` (record Administrator) merender form "Ubah Data User" lengkap, dan field `password` **berisi nilai asli**. Satu langkah lagi (submit) berarti pengambilalihan akun penuh. Kami **tidak** melakukan submit.

Rantai: menu **Users** terlihat untuk CS → daftar user → edit user mana pun → password plaintext.

### K-2 (TINGGI) — Otorisasi per halaman, bukan terpusat
Tidak ada middleware yang konsisten. Bukti: `add-user`/`data-ipl` kosong untuk CS, tetapi `data-gaji-karyawan`, `finance-accounting-dashboard`, `data-router`, `data-perusahaan`, `data-diskon`, `data-pemasukan-validasi` tetap dirender. Halaman kosong pun tetap **HTTP 200** tanpa pesan "403/akses ditolak".

### K-3 (TINGGI) — Menu bukan kontrol keamanan
Menyembunyikan menu tidak menghalangi akses URL. Semua halaman dapat dipanggil langsung lewat `?page=`.

### K-4 (TINGGI) — CS bisa membuka form tambah pelanggan (66 field)
Bisa jadi memang disengaja (CS mendaftarkan pelanggan), tetapi tidak ada pembedaan hak antara "membuat pelanggan" dan "mengubah data keuangan".

### K-5 (SEDANG) — Payroll & finance terlihat oleh role non-keuangan
Teknisi dan CS dapat membuka halaman payroll dan dashboard finance. Bila query AJAX-nya tidak memfilter role, ini kebocoran data gaji.

### K-6 (SEDANG) — Tidak ada CSRF
Dikombinasikan dengan K-1/K-2, serangan CSRF ke form yang bisa dibuka role rendah berpotensi mengubah data.

### K-7 (SEDANG) — Kredensial plaintext di HTML
Password dikirim ke klien dalam `value="..."`. Termasuk password admin. Ini juga berarti password tersimpan tanpa hash (atau hash yang bisa dibalik).

---

## 5. Implikasi untuk PRD

PRD §2.2 sebelumnya adalah matriks **target desain**. Hasil verifikasi ini menetapkan kebutuhan tambahan yang wajib ada di produk baru:

1. **Deny-by-default**: setiap route punya policy eksplisit; tidak ada halaman yang "kebetulan terbuka".
2. **Object-level authorization**: cek `lokasi_id`/kepemilikan record, bukan hanya nama halaman.
3. **Password tidak pernah dikirim ke klien**; reset lewat token, bukan menampilkan nilai.
4. **403 eksplisit**, bukan halaman kosong 200.
5. **Menu = UX, bukan kontrol**; kontrol ada di server.
6. **Audit setiap akses ke data sensitif** (payroll, kredensial, keuangan), bukan hanya mutasi.
7. **Rate limit + alert** bila role rendah mengakses halaman di luar wewenangnya berulang kali.

Matriks akses final tetap menunggu verifikasi role Sales/HRD/Reseller/NOC yang akunnya belum tersedia.
