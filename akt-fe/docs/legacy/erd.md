# Analisis ERD — e-Billing System V.3.0

Dokumen ini adalah **rekonstruksi model data** dari bukti HTML (lihat `data-dictionary.md`), bukan dari sumber kode/database. Setiap entitas diberi tingkat keyakinan.

> Untuk desain database baru yang sudah dinormalisasi (PostgreSQL, UUID,
> English naming, double-entry), lihat [`database-design.md`](database-design.md)
> dan ERD `erd-v2-*.mmd`.

Diagram:
- `erd-core.mmd` — pelanggan, jaringan, langganan, ticket, poin
- `erd-keuangan.mmd` — pembayaran, kas, akuntansi, voucher
- `erd-sdm.mmd` — karyawan, absensi, payroll

---

## 1. Temuan arsitektur paling penting

### 1.1 Satu tabel untuk semua orang: `warga`

Aplikasi **tidak** memisahkan pelanggan, karyawan, sales, teknisi, admin, dan reseller. Semuanya satu tabel (`warga`), dibedakan oleh kolom `level`.

Bukti:
1. Form **Tambah User** (`?page=add-user`) mengirim field `nama_warga`, `id_lokasi`, `tlp`, `nik`, `foto_ktp`, `alamat`, `kelurahan`, `kecamatan` — identik dengan form pelanggan.
2. Form **Ubah User** (`?page=edit-user&kode=...`) punya hidden field **`id_warga`**.
3. Tabel `data-user` menampilkan kolom yang sama dengan `data-warga`: Nama, Alamat, Tlp, NIK, Foto KTP, **Level**, Status.
4. `data-warga-baru` juga menampilkan kolom **Level**.
5. Dropdown `id_sales` pada form pelanggan berisi `PT.ANDIKA KOMUNIKA TAMA-Administrator`, `Dami Teknisi-Teknisi`, `Prajnia Paramita Sulistiyanto-CS` → record `warga` dengan level staf.
6. `edit-user` dan `add-user` memakai field `jns_pembagian_fee`, `metode_insentif`, `insentif_sales` yang juga ada di `add-warga`.

**Implikasi**: relasi `warga → warga` (self-reference) untuk `id_sales` bukan relasi ke tabel "sales", melainkan ke baris `warga` lain. Filter "pelanggan" vs "user" dilakukan lewat `level`.

### 1.2 `perusahaan` adalah baris `lokasi` (keyakinan: sedang)

`?page=edit-perusahaan&kode=ODg4Ng==` mengirim field `id_lokasi`, `nama_lokasi`, `alamat_lokasi`, `tlp_lokasi`, lalu field perusahaan (logo, tagihan, BHP, USO, fee ISP). Artinya profil perusahaan menempel pada record `lokasi` yang sama, bukan tabel terpisah.

**Asumsi**: `lokasi` menyimpan 1 baris "kantor pusat" + N baris cabang; `data-perusahaan` menampilkan baris pusat.

### 1.3 Denormalisasi agresif

Banyak nilai disimpan berulang di beberapa tabel, bukan diambil via join:
- `nama_lokasi`, `nama_sales`, `nama_pelanggan`, `nama_router` muncul sebagai kolom di tabel pembayaran, ticket, poin, dll.
- `jumlah_pelanggan` disimpan di `lokasi`, `router`, `tipe_pembayaran`.
- `saldo` disimpan di `akun` dan juga dihitung ulang di `mutasi`.

Ini menjelaskan mengapa aplikasi bisa cepat tanpa join, tapi rawan data tidak konsisten.

---

## 2. Daftar entitas

### 2.1 Master pelanggan & referensi (keyakinan: tinggi)

| Entitas | Bukti | Catatan |
|---|---|---|
| `warga` | add-warga (67 field), add-user (18), edit-user (21) | pelanggan + staf dalam satu tabel |
| `lokasi` | add-lokasi (6), edit-lokasi (8), data-lokasi (4 baris) | unit bisnis/cabang; juga menyimpan profil perusahaan |
| `router` | add-router (5), edit-router (7) | kredensial MikroTik API |
| `tipe_pembayaran` | add-tipe-pembayaran (16), edit (10) | = paket/langganan; 13 baris |
| `diskon` | 5 form add-diskon* | scope: pelanggan / semua / lokasi / paket / paket+lokasi |
| `rekening` | add-rekening (5), edit (6) | rekening bank & kas |
| `akun` | add-akun (7), finance-accounting-daftar-akun | COA / chart of accounts |
| `payment_gateway` | add-payment-gateway (11) | XENDIT/MOOTA/TRIPAY/DUITKU/PAKARDIGITAL |
| `genieacs` | add-genieacs-server (2) | ACS TR-069 |
| `olt` | add-olt-new (11) | Telnet + SNMP |
| `perangkat_pasif` | add-odp (18), data-odp (22 kolom) | ODP/ODC/OLT/SPLITTER/SWITCH/OTB/JOINT CLOSURE |
| `tiang` | add-tiang (5) | + foto + koordinat |
| `antena` | add-antena (8) | radio/AP |
| `tunnel` | add-tunnel (1) | VPN ke router |
| `shift` | data-master-absensi (12 kolom) | shift kerja per cabang + geofence absensi |
| `notifikasi_template` | edit-notifikasi (4/9 field), 15 baris | template pesan WA |
| `mail_server` | edit-mail-server (7) | SMTP tunggal |

### 2.2 Transaksi pelanggan

| Entitas | Bukti | Keyakinan |
|---|---|---|
| `langganan` | turunan dari field `id_tipe_pembayaran`, `tgl_registrasi`, `tgl_jatuh_tempo`, `status` di `warga` | sedang — bisa jadi bukan tabel terpisah |
| `tagihan` | `add-tagihan` (11 field), `data-tagihan` (17 kolom) | tinggi |
| `pembayaran` | `data-ipl` (16 kolom), `data-setor`, `data-pemasukan-validasi` | tinggi |
| `pemasukan_non_langganan` | `add-ipl-non` (id_warga, id_tipe_pembayaran, jml_barang, total) | tinggi |
| `deposit` | `data-deposit-pelanggan`, `data-deposit` (reseller) | tinggi |
| `poin_saldo`, `poin_pengaturan`, `poin_hadiah`, `poin_penukaran` | modul poin | tinggi |
| `pengumuman` | `add-pengumuman` (12 field, 8 filter) | tinggi |
| `ticket`, `ticket_detail`, `installasi` | `add-laporan-general-` (8), `edit-laporan-pelanggan-` (8), `edit-laporan-pelanggan--` (riwayat dengan `waktu_update`) | tinggi |
| `berita_acara` | `data-laporan-pelanggan-berita-acara` | sedang |
| `perangkat_ticket` | `add-perangkat-ticket-pelanggan` | sedang |

### 2.3 Keuangan & akuntansi

`pemasukan`, `pengeluaran`, `setor`, `mutasi`, `contact`, `petty_cash`, `rembursment`, `payment_request`, `balance_entry`, `po`.

Yang menonjol: `mutasi` berperan sebagai **buku besar** (kredit/debit/saldo per tanggal), sementara `pembayaran`/`pemasukan`/`pengeluaran` adalah dokumen sumber. Tidak terlihat adanya tabel jurnal double-entry terpisah.

### 2.4 SDM

`master_gaji` (1:1 `warga`), `shift`, `absensi`, `lembur`, `cuti`, `tunjangan`, `pemotongan`, `piutang_karyawan`, `payroll_periode`, `gaji_bulanan`, `pekerjaan_harian`.

`data-gaji-karyawan` membuktikan payroll dihitung dari agregasi: hari kerja, izin, cuti, absen, lembur, tunjangan, potongan.

### 2.5 Voucher & reseller

`voucher_harga` → `voucher_item` (username/password/status) → `penjualan_voucher` → `setor_voucher`. Reseller = `warga` dengan `level` Reseller/Agen + `server_akses`.

### 2.6 WhatsApp / Telegram

`wa_api`, `wa_device`, `wa_sent`, `wa_outbox`, `wa_fail`, `wa_in`, `wa_group`, `telegram_group`, `virtual_assistant`, `blast`.

---

## 3. Kardinalitas kunci

```
lokasi 1 ── N router
lokasi 1 ── N warga
lokasi 1 ── N tipe_pembayaran
lokasi 1 ── 1 profil perusahaan (asumsi)
router 1 ── N warga
router 1 ── N tipe_pembayaran (profil)
tipe_pembayaran 1 ── N warga
warga 1 ── N warga            (self: id_sales)
warga 1 ── N tagihan
warga 1 ── N pembayaran
warga 1 ── N deposit
warga 1 ── N diskon
warga 1 ── 1 poin_saldo
warga 1 ── N ticket
warga 1 ── 1 master_gaji      (jika level = karyawan)
warga 1 ── N absensi
olt 1 ── N perangkat_pasif
perangkat_pasif(ODC) 1 ── N perangkat_pasif(ODP)   (self: id_odc)
tiang 1 ── N perangkat_pasif
akun 1 ── N petty_cash / rembursment / payment_request
rekening 1 ── N mutasi
voucher_harga 1 ── N voucher_item
voucher_item 1 ── 0..1 penjualan_voucher
```

---

## 4. Enum yang berhasil dipanen

| Field | Nilai | Bukti |
|---|---|---|
| `level` (role) | 24 nilai: Administrator, Investor, Investor Cabang, HRD, Kepala Cabang, Admin Lokasi, Admin Cabang, Admin Pusat, Admin Gudang, Sales, Kepala Sales, Kepala Sales Cabang, Kepala Teknisi, Kepala Teknisi Cabang, Teknisi, Teknisi Lokasi, Teknisi Cabang, NOC, CS, CS Cabang, Karyawan, Reseller, Agen, Playstore User | add-user |
| `status` (warga) | Aktif, Tidak Aktif | edit-user |
| `jns_pelanggan` | Pelanggan Lama, Pelanggan Baru, Pelanggan Survey | add-warga |
| `jns_koneksi` | Dynamic, Static, PPPOE, Hotspot, IPBiddings | add-warga |
| `metode_pembuatan` | Buat Baru, Sinkronisasi, Manual | add-warga |
| `jns_tipe_pembayaran` | Wajib Tiap Bulan, Tidak Wajib Tiap Bulan | add-tipe-pembayaran |
| `metode_diskon` | Presentase, Nominal | add-diskon* |
| `jns_laporan` | 20 nilai: Gangguan/Komplain, Edukasi, Installasi, Custom Features, Aktivasi, Survey Baru, Upgrade, Maintenance, Reaktivasi, Downgrade, Setup Wifi, Deaktivasi, Pindah Alamat, Setup IP Cam, Penarikan Kabel, Dismentle Perangkat, Radio, Fiber Optik, Pembayaran, Lain-Lain | data-laporan-pelanggan-closed |
| `status` (ticket) | Dalam Penanganan, Permintaan Aktivasi, Jadwal Pemasangan, Pemasangan Berhasil Dilakukan, Pemasangan Gagal Dilakukan, Pending, Closed | edit-laporan-pelanggan- |
| `vendor` OLT | ZTE, HUAWEI, HSGQ, HIOSO, C-DATA | add-olt-new |
| `jenis` payment gateway | XENDIT, MOOTA, TRIPAY, DUITKU, PAKARDIGITAL | add-payment-gateway |
| `jns_tunjangan` / `jenis_pemotongan` | Wajib Tiap Bulan, Tidak Wajib Tiap Bulan | add-tunjangan / add-pemotongan |
| `jenis` cuti | Cuti, Izin | add-cuti-karyawan |
| `jns_pembagian_fee` | Pembagian Hasil, Penambahan Biaya Admin | add-user |
| `metode_insentif` | Presentase, Nominal | add-lokasi / add-diskon |

---

## 5. Ketidakpastian & open questions

1. **`langganan`**: tidak ada halaman CRUD langganan terpisah; kemungkinan paket & jatuh tempo disimpan langsung di `warga` (1 pelanggan = 1 langganan aktif). Perlu konfirmasi bila ingin mendukung multi-langganan per pelanggan.
2. **`perusahaan`**: apakah benar baris `lokasi`, atau tabel `lokasi` yang dipakai ulang sebagai `perusahaan`? Bukti kuat tapi belum 100%.
3. **`kartu_member`**: tidak ada form sendiri; kemungkinan hanya tampilan dari `warga` (username/password + no identitas) + halaman publik.
4. **`data-tipe-ipl`, `data-tipe-bandwith`, `finance-accounting-manage-kategori`, `data-monitoring-pppoe`, `data-rekening-payment-gateway`, `finance-accounting-cash-bank`, `corporate`**: halaman kosong saat diakses (modul belum aktif / butuh parameter). Tidak bisa disimpulkan.
5. **Tabel pivot `diskon`**: 5 varian form menunjukkan satu tabel dengan `scope` + kolom nullable, bukan 5 tabel. Belum dipastikan.
6. **`ticket_detail`**: field `waktu_update` dipakai sebagai bagian URL (`edit-laporan-pelanggan--&kode=..&waktu_update=..`), menandakan composite key atau optimistic locking sederhana.
7. **ID**: semua id numerik internal, diobfusikasi base64 pada URL (`kode=`), kecuali `id_lokasi` yang kadang dikirim mentah (`id_lokasi=18051`).

---

## 6. Utang teknis skema (warisan ke desain klon)

| Masalah | Contoh | Dampak |
|---|---|---|
| Nama field mengandung spasi | `id pelanggan`, `nominal pemasukan` | tidak bisa dipetakan otomatis ke ORM |
| Singkatan tidak konsisten | `jns_`, `tlp`, `telp`, `ketarangan`, `hadian` | salah tulis ikut terbawa |
| Tabel "serba bisa" | `warga` untuk 24 role | query rawan bocor data antar role |
| Password plaintext | `warga.password`, `antena.password`, `router.password`, `olt.password_telnet`, `mail_server.pass`, `payment_gateway.password/pass_api` | risiko besar |
| Nominal tidak bertipe ketat | `harga`, `nominal*` kadang `text` | validasi longgar |
| Tidak ada soft delete konsisten | sebagian pakai `status`, sebagian pakai `del-*` | audit trail hilang |
| Denormalisasi nama | `nama_lokasi`, `nama_sales` di banyak tabel | update nama harus massal |
| Enum disimpan sebagai string | `level`, `status`, `jns_*` | tidak ada referential integrity |
