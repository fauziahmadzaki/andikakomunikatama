# PRD — e-Billing ISP (Rekonstruksi & Rancangan Ulang)

| Field | Nilai |
|---|---|
| Nama produk | e-Billing System (rebuild) |
| Versi dokumen | 1.0 |
| Tanggal | 21 Oktober 2026 |
| Basis | Reverse engineering read-only terhadap `https://e.ebilling.id:2053/billing/` (344 halaman, 247 modul) |
| Perusahaan acuan | PT. ANDIKA KOMUNIKA TAMA |
| Bahasa | Indonesia |
| Status | Draf untuk diskusi — stack teknis **belum diputuskan** (lihat §12) |

Dokumen pendukung:
- `sitemap.md` — inventaris 247 modul per domain
- `data-dictionary.md` — kolom tabel & field form per modul (bukti mentah)
- `erd.md`, `erd-core.mmd`, `erd-keuangan.mmd`, `erd-sdm.mmd` — model data
- `flows.md` — state machine & alur bisnis
- `fitur-kelola-data.md` — pendalaman modul Kelola Data

---

## 1. Ringkasan eksekutif

Aplikasi existing adalah sistem operasi ISP (BUKAN sekadar billing): mencakup master pelanggan, provisioning MikroTik/OLT/GenieACS, penagihan, pembayaran multi-kanal, tiket gangguan, inventaris perangkat, payroll karyawan, voucher hotspot, poin pelanggan, sampai akuntansi dan kemitraan.

Hasil reverse engineering menemukan tiga hal yang menentukan arah produk baru:

1. **Satu tabel `warga` dipakai untuk 24 role** (pelanggan, sales, teknisi, admin, reseller). Ini sumber utama kompleksitas otorisasi dan pelaporan.
2. **Aplikasi sangat terikat perangkat**: 17 field MikroTik + 5 field OLT/ONU dalam satu form pelanggan, ditambah Telnet/SNMP ke OLT dan TR-069 ke GenieACS.
3. **Tidak ada lapisan keamanan modern**: tanpa CSRF token, password perangkat & pelanggan tersimpan/ditampilkan plaintext, PHP 7.4 sudah EOL, ID di URL hanya di-base64.

PRD ini mendefinisikan ulang produk secara modular dengan tetap mempertahankan perilaku bisnis yang sudah berjalan, sambil menutup celah keamanan dan menyiapkan skala.

**Non-goals (v1)**: aplikasi mobile pelanggan native, machine learning churn, billing pra-bayar prabayar di luar voucher, dan penggantian penuh akuntansi (cukup integrasi/ekspor).

---

## 2. Pengguna & peran

### 2.1 Persona

| Persona | Kebutuhan utama | Level existing |
|---|---|---|
| Pemilik / Investor | Melihat pendapatan, BHP/USO/fee ISP, margin per mitra | Administrator, Investor, Investor Cabang |
| Manajer cabang | Operasional cabang, target sales, kinerja teknisi | Kepala Cabang, Admin Cabang, Admin Pusat |
| Admin operasional | Input pelanggan, tagihan, pembayaran, voucher | Admin Lokasi, Admin Pusat, CS, CS Cabang |
| Sales / Mitra | Daftarkan pelanggan, pantau komisi & setoran | Sales, Kepala Sales, Reseller, Agen |
| Teknisi / NOC | Tiket, instalasi, monitoring jaringan | Teknisi (+Lokasi/Cabang), Kepala Teknisi, NOC |
| HRD / Payroll | Absensi, cuti, lembur, gaji | HRD, Karyawan |
| Admin gudang | Stok perangkat, pemasangan, pengembalian | Admin Gudang |
| Pelanggan | Cek tagihan, bayar, ajukan gangguan, tukar poin | Playstore User (via APK/kartu member) |

### 2.2 Matriks hak akses (target)

| Kapabilitas | Pemilik | Manajer | Admin/CS | Sales/Mitra | Teknisi/NOC | HRD | Pelanggan |
|---|---|---|---|---|---|---|---|
| Lihat dashboard keuangan | penuh | cabang | terbatas | sendiri | tidak | tidak | tidak |
| CRUD pelanggan | ✓ | ✓ | ✓ | hanya binaan | baca | tidak | profil sendiri |
| CRUD paket & diskon | ✓ | ✓ | ✓ | tidak | tidak | tidak | tidak |
| Catat pembayaran | ✓ | ✓ | ✓ | ✓ (cash) | tidak | tidak | bayar sendiri |
| Isolir / aktivasi | ✓ | ✓ | ✓ | tidak | ✓ | tidak | tidak |
| CRUD router/OLT | ✓ | baca | tidak | tidak | ✓ | tidak | tidak |
| Ticket | ✓ | ✓ | ✓ | buat | eksekusi | tidak | buat + pantau |
| Payroll | baca | baca | tidak | tidak | tidak | ✓ | tidak |
| Voucher | ✓ | ✓ | ✓ | jual | tidak | tidak | beli |
| Akuntansi | ✓ | baca | tidak | tidak | tidak | tidak | tidak |

> **Status verifikasi (21 Okt 2026)**: 3 role sudah diuji langsung — Administrator, **CS**, dan **Teknisi**. Hasil lengkap di `rbac.md`. Ringkasnya: menu memang difilter per role, tetapi **otorisasi server-side tidak konsisten** — CS bisa membuka form `edit-user` milik Administrator dan melihat password plaintext, serta membuka halaman payroll/finance. Matriks di atas adalah target desain; role Sales/HRD/Reseller/NOC belum bisa diverifikasi karena akunnya tidak tersedia.

---

## 3. Arsitektur informasi

14 domain, 247 modul (detail di `sitemap.md`):

| # | Domain | Modul | Isi |
|---|---|---|---|
| 1 | Dashboard & Monitoring | 46 | dashboard cabang/sales/mitra/PPOB/voucher, pemetaan, monitoring PPPoE/hotspot/static, ping, sesi |
| 2 | Pelanggan | 15 | data pelanggan, nonaktif, kartu member, instalasi, import, poin, status langganan, pengumuman |
| 3 | Paket, Diskon & Deposit | 16 | tipe pembayaran, tipe IPL/bandwidth, diskon (5 varian), deposit |
| 4 | Tagihan & Pembayaran | 28 | IPL, setor, tagihan manual, mutasi, pemasukan/pengeluaran, PO, akun, rekening, faktur |
| 5 | Jaringan & Aset | 24 | router, OLT, ODP/ODC, tiang, antena, tunnel, GenieACS, inventaris perangkat, speedtest |
| 6 | Ticket & Laporan Pelanggan | 29 | ticket pelanggan/general, jadwal pemasangan, berita acara, instalasi |
| 7 | SDM, Payroll & Absensi | 20 | master gaji, absensi, shift, lembur, cuti, tunjangan, pemotongan, piutang, rekap |
| 8 | Voucher & Reseller | 4 | harga voucher, generate, penjualan, setoran |
| 9 | Poin & Hadiah | 4 | aturan poin, katalog hadiah, penukaran |
| 10 | Finance & Accounting | 24 | COA, contact, petty cash, rembursment, payment request, balance |
| 11 | WhatsApp/Telegram/Notifikasi | 12 | template, blast, gateway, log sent/outbox/fail |
| 12 | Kemitraan & Cabang | 1 | dashboard mitra, BHP/USO/fee ISP |
| 13 | Pengaturan Sistem | 10 | perusahaan, user, log, banner, APK, mail server, push notif |
| 14 | Lain-lain | 14 | form tambah yang belum terklasifikasi |

---

## 4. Kebutuhan fungsional

Format: `ID · Prioritas (M=must, S=should, C=could, W=won't-v1) · Modul acuan`.

### 4.1 Autentikasi & Otorisasi

| ID | Requirement | P |
|---|---|---|
| AUTH-01 | Login memakai 3 kredensial: **account** (ID perusahaan/tenant), **username**, **password**. Pesan error tidak boleh membocorkan mana yang salah. | M |
| AUTH-02 | Sesi berakhir otomatis (idle 60 menit, absolut 12 jam), cookie `HttpOnly; Secure; SameSite=Lax`, rotasi session ID saat login. | M |
| AUTH-03 | Otorisasi berbasis **role + scope lokasi**. 24 level existing dipetakan ke role kanonik; akses data dibatasi `lokasi_id` milik user. | M |
| AUTH-04 | Setiap mutasi tercatat di audit log: siapa, kapan, entitas, sebelum/sesudah, IP, user agent. | M |
| AUTH-05 | Reset password via email/WA dengan token sekali pakai (menggantikan "Lupa Password" existing). | S |
| AUTH-06 | 2FA (TOTP) wajib untuk role Pemilik, Admin Pusat, HRD. | S |
| AUTH-07 | Login API terpisah untuk integrasi mesin-ke-mesin (token, rate limit, scope). | S |
| AUTH-08 | **Deny-by-default**: setiap route wajib punya policy eksplisit; akses tanpa izin mengembalikan **403 eksplisit**, bukan halaman kosong berstatus 200. Menu hanya alat bantu UX, bukan kontrol keamanan. | M |
| AUTH-09 | **Tidak ada secret di HTML**: password/kredensial tidak pernah dirender ke klien (termasuk pada form edit). Reset password memakai token sekali pakai; kolom password tidak pernah pre-filled. | M |
| AUTH-10 | Otorisasi tingkat objek: akses record divalidasi terhadap `lokasi_id`/kepemilikan, bukan hanya nama halaman (mencegah IDOR lewat `kode=`). | M |
| AUTH-11 | Audit & alert untuk **akses baca** ke data sensitif (payroll, kredensial, keuangan), bukan hanya mutasi. | S |

**Acceptance criteria (AUTH-03):**
```gherkin
Scenario: Admin cabang tidak bisa melihat pelanggan cabang lain
  Given user dengan role "Admin Cabang" dan lokasi "AKR BATU"
  When membuka daftar pelanggan
  Then hanya pelanggan dengan lokasi "AKR BATU" yang tampil
  And permintaan API ke id pelanggan cabang lain mengembalikan 403
```

### 4.2 Master pelanggan

| ID | Requirement | P |
|---|---|---|
| CUST-01 | CRUD pelanggan dengan **wizard 4 langkah** (Identitas → Alamat → Jaringan → Langganan) menggantikan 1 form 67 field. Setiap langkah bisa disimpan sebagai draft. | M |
| CUST-02 | `ID Pelanggan` auto-generate (pola dapat dikonfigurasi) dengan opsi override manual; unik per tenant. | M |
| CUST-03 | Riwayat perubahan pelanggan (field-level) + siapa yang mengubah. | M |
| CUST-04 | Nonaktifkan/aktifkan pelanggan (soft delete) dengan alasan; daftar terpisah untuk nonaktif. | M |
| CUST-05 | Import Excel dengan template, validasi baris, laporan gagal per baris, dan mode dry-run. | M |
| CUST-06 | Export Excel/CSV sesuai filter aktif + kolom terpilih (fitur "Atur Kolom"). | M |
| CUST-07 | Pencarian & filter: lokasi, router, paket, jatuh tempo, status, level, sales; pencarian nomor HP/ID. | M |
| CUST-08 | Profil 360°: data, langganan, tagihan, pembayaran, tiket, perangkat terpasang, poin, riwayat. | S |
| CUST-09 | Kartu member digital: halaman publik (token), QR, tombol salin tautan, kredensial aplikasi pelanggan. | S |
| CUST-10 | Segmentasi pelanggan (belum lunas, prorate, kurang bayar, nonaktif, per paket) sebagai *saved segment* yang bisa dipakai untuk campaign/notifikasi. | S |
| CUST-11 | Pelanggan corporate: 1 badan usaha dengan banyak titik layanan (multi-site). | C |

**Aturan validasi wajib**: `nama`, `id_lokasi`, `tlp` (format Indonesia), `alamat`, `id_tipe_pembayaran`, `tgl_registrasi`, `id_sales`, minimal salah satu dari `nik`/`no_identitas`. NIK harus unik (kecuali corporate). Nomor HP unik per tenant dengan toleransi format `08xx`/`628xx`.

### 4.3 Paket, prorate, diskon

| ID | Requirement | P |
|---|---|---|
| PKG-01 | CRUD paket: nama, keterangan (speed), harga, jenis (wajib/tidak wajib bulanan), lokasi, profil router/jaringan, filter lokasi. | M |
| PKG-02 | Harga paket menyimpan riwayat (berlaku mulai) agar tagihan lama tidak berubah saat harga naik. | M |
| PKG-03 | **Prorate**: pelanggan baru dihitung proporsional `hari_pakai / hari_bulan × harga`, dengan opsi bulat ke atas/bawah. | M |
| PKG-04 | **PPN**: flag per pelanggan & per paket; tarif global dapat diubah (existing 11%). Nominal PPN ditampilkan terpisah di invoice. | M |
| PKG-05 | Diskon dengan 5 cakupan: pelanggan, semua, per lokasi, per paket, per paket+lokasi. Metode persentase/nominal, punya periode berlaku, bisa dihentikan. | M |
| PKG-06 | Migrasi massal paket/lokasi/router/sales/jatuh tempo dengan preview jumlah terdampak. | S |
| PKG-07 | Multi-langganan per pelanggan (mis. internet + IPTV) — **perluasan** dari model existing 1:1. | C |

**Acceptance (PKG-03):**
```gherkin
Scenario: Prorate pelanggan baru tanggal 20
  Given paket Rp 150.000/bulan dan bulan berjalan 31 hari
  When pelanggan registrasi tanggal 20 dengan prorate = YA
  Then tagihan = ceil((31 - 20 + 1) / 31 × 150.000) = Rp 58.065
  And invoice menampilkan jumlah hari pemakaian
```

### 4.4 Tagihan & pembayaran

| ID | Requirement | P |
|---|---|---|
| BILL-01 | Generate tagihan massal per periode (bulan), per lokasi/paket/jatuh tempo, dengan pratinjau dan idempotensi (tidak dobel). | M |
| BILL-02 | Tagihan manual (`nama_tagihan`, nominal, jatuh tempo, periode) untuk biaya di luar langganan, termasuk diskon. | M |
| BILL-03 | Pencatatan pembayaran multi-metode: tunai, transfer bank, payment gateway, deposit, dan "bayar sekarang" oleh pelanggan. | M |
| BILL-04 | Upload bukti pembayaran (gambar/PDF), validasi admin, status: menunggu → terverifikasi/ditolak. | M |
| BILL-05 | Kekurangan bayar: sistem menghitung `nominal_harus_dibayar - nominal_dibayar` dan menandai status kurang bayar. | M |
| BILL-06 | Setoran sales: rekap cash yang harus disetor, status belum/sudah setor, bukti setor. | M |
| BILL-07 | Kuitansi/invoice PDF dengan nomor unik, logo perusahaan, rekening tampil (broadband vs corporate), QR verifikasi. | M |
| BILL-08 | Deposit pelanggan: pencatatan, pemakaian otomatis untuk tagihan berikutnya, sisa saldo terlihat. | S |
| BILL-09 | Payment gateway: kredensial per metode (Xendit/Tripay/Moota/Duitku/PakarDigital), beban biaya admin ke pelanggan/perusahaan, callback idempoten. | S |
| BILL-10 | Rekonsiliasi otomatis: cocokkan mutasi rekening/PG dengan pembayaran, tampilkan selisih. | S |
| BILL-11 | Denda keterlambatan & biaya admin keterlambatan. | C |

**Acceptance (BILL-03):**
```gherkin
Scenario: Pembayaran sebagian
  Given tagihan Rp 150.000 dengan status belum lunas
  When admin mencatat pembayaran Rp 100.000 metode tunai
  Then status menjadi "kurang bayar" dengan sisa Rp 50.000
  And mutasi kas bertambah Rp 100.000
  And pelanggan tetap muncul di daftar belum lunas
```

### 4.5 Isolir & status layanan

| ID | Requirement | P |
|---|---|---|
| ISO-01 | Status langganan `On/Off` per pelanggan, sinkron dengan status koneksi router (up/down/unknown). | M |
| ISO-02 | Isolir manual & massal per jenis koneksi (Static / PPPoE / Hotspot), dengan alasan dan jadwal. | M |
| ISO-03 | Isolir otomatis terjadwal: pelanggan belum bayar melewati `jatuh_tempo + grace` → isolir; pembayaran masuk → aktivasi otomatis. | M |
| ISO-04 | Audit setiap perubahan status (siapa/kenapa/kapan) + notifikasi ke pelanggan. | M |
| ISO-05 | Monitoring konektivitas: sesi PPPoE/hotspot, ping target, status perangkat; alert bila down > N menit. | S |

### 4.6 Jaringan & aset

| ID | Requirement | P |
|---|---|---|
| NET-01 | CRUD router (nama, host:port API, kredensial di secret store), tes koneksi, lihat profil/secret/queue, backup konfigurasi. | M |
| NET-02 | CRUD OLT: vendor/model, host, Telnet, SNMP (community/version), status akses; polling environment (suhu, tegangan) & grafik 24 jam/7/30 hari. | M |
| NET-03 | Topologi pasif: ODP/ODC/SPLITTER/SWITCH/OTB/JOINT CLOSURE dengan relasi ke OLT, ODC induk, tiang, port, warna kabel, kapasitas vs terpakai. | M |
| NET-04 | Tiang: kode, nama, koordinat, foto, lokasi; import Excel. | M |
| NET-05 | Antena/radio: MAC, IP, SSID, frekuensi, channel, kredensial (terenkripsi). | S |
| NET-06 | Tunnel/VPN per router. | S |
| NET-07 | GenieACS (TR-069): registrasi server, daftar ONU/CPE, status online, reboot (dengan approval). | S |
| NET-08 | Inventaris perangkat: stok awal, mutasi masuk/keluar/terpasang/kembali, harga per unit, SN/MAC, penerima, foto serah terima, rekap stok & nilai. | S |
| NET-09 | Peta interaktif: sebaran pelanggan, ODP, ODC, OLT, tiang; cari ODP terdekat dari koordinat pelanggan. | S |
| NET-10 | Speedtest server: daftar server, prioritas, health check, hasil tes. | C |

**Aturan**: semua kredensial perangkat disimpan terenkripsi (envelope encryption/KMS), tidak pernah dikirim ke klien dalam bentuk plaintext, dan setiap penggunaan dicatat.

### 4.7 Ticket & pekerjaan lapangan

| ID | Requirement | P |
|---|---|---|
| TCK-01 | Buat tiket pelanggan (terhubung ke pelanggan) dan tiket general (tanpa pelanggan, mis. pekerjaan internal/project). | M |
| TCK-02 | 20 jenis laporan (Gangguan, Edukasi, Instalasi, Aktivasi, Survey, Upgrade, Maintenance, Reaktivasi, Downgrade, Setup Wifi, Deaktivasi, Pindah Alamat, Setup IP Cam, Penarikan Kabel, Dismentle, Radio, Fiber Optik, Pembayaran, Custom, Lain-lain). | M |
| TCK-03 | State machine 8 status: Open → Dalam Penanganan → (Pending) → Jadwal Pemasangan → Pemasangan Berhasil/Gagal → Closed; plus Permintaan Aktivasi. Transisi dibatasi role. | M |
| TCK-04 | Penugasan hingga 2 teknisi + penanggung jawab; notifikasi ke teknisi. | M |
| TCK-05 | Riwayat penanganan (append-only): keterangan, foto, status, oleh siapa, waktu; tidak bisa diedit setelah disimpan (koreksi via entri baru). | M |
| TCK-06 | Jadwal pemasangan (tanggal, slot waktu, teknisi) + tampilan kalender. | S |
| TCK-07 | Berita acara pemasangan: generate PDF dari data tiket + tanda tangan + foto. | S |
| TCK-08 | Perangkat terpakai per tiket → otomatis mengurangi stok inventaris. | S |
| TCK-09 | SLA & durasi: hitung waktu respons/penyelesaian, eskalasi bila melewati target. | S |
| TCK-10 | Kanban board per status untuk teknisi/NOC. | C |

### 4.8 SDM, absensi & payroll

| ID | Requirement | P |
|---|---|---|
| HR-01 | Master karyawan: data pribadi, kontak darurat, tanggal bergabung/berakhir, jabatan, rekening, shift, gaji pokok, tunjangan harian, nominal lembur/jam, hak cuti. | M |
| HR-02 | Shift per cabang dengan geofence (titik koordinat masuk/pulang, radius maksimum, multi-shift). | M |
| HR-03 | Absensi masuk/pulang: foto, koordinat, jarak vs radius, deteksi telat, durasi kerja; koreksi absensi oleh HRD dengan audit. | M |
| HR-04 | Cuti/izin: kuota tahunan, saldo, pengajuan, approval, kalender tim. | M |
| HR-05 | Lembur: pengajuan, verifikasi, approval massal, nilai per jam dari master gaji. | M |
| HR-06 | Tunjangan & pemotongan: periodik (wajib bulanan) atau insidental. | M |
| HR-07 | Piutang karyawan: pinjaman, pemotongan gaji otomatis, sisa hutang. | M |
| HR-08 | Cut-off penggajian (tanggal mulai–akhir, bulan sama/berikutnya) → payroll run menghasilkan gaji kotor, potongan, gaji bersih; lock setelah dibayar. | M |
| HR-09 | Slip gaji PDF + rekap transfer bank. | S |
| HR-10 | Pekerjaan harian (daily activity) karyawan dengan foto. | C |

**Acceptance (HR-08):**
```gherkin
Scenario: Payroll bulanan
  Given cut-off 26 September - 25 Oktober
  And karyawan punya 20 hari kerja, 2 izin, 1 alpha, lembur 4 jam
  When HRD menjalankan payroll periode Oktober
  Then gaji kotor = pokok + (tunjangan harian × hari kerja) + (lembur/jam × 4)
  And gaji bersih = gaji kotor - pemotongan - cicilan piutang
  And slip gaji tersedia dan periode terkunci
```

### 4.9 Voucher & reseller

| ID | Requirement | P |
|---|---|---|
| VCH-01 | Harga voucher: nama, harga jual/beli, profil hotspot, lokasi, router, script on-login. | M |
| VCH-02 | Generate voucher massal (jumlah, batch, prefix, masa aktif) → user hotspot otomatis. | M |
| VCH-03 | Penjualan oleh admin, reseller, dan mandiri (halaman publik); hitung keuntungan reseller. | M |
| VCH-04 | Setoran reseller: nominal, bukti, penerima; rekap saldo reseller. | M |
| VCH-05 | Cek voucher publik (kode → status, masa aktif, sisa kuota). | S |
| VCH-06 | Monitoring pemakaian voucher (uptime, bytes in/out). | S |

### 4.10 Poin pelanggan

| ID | Requirement | P |
|---|---|---|
| PNT-01 | Aturan poin: nama aturan, ketentuan (mis. per pembayaran), nilai poin, berlaku per lokasi. | S |
| PNT-02 | Saldo poin per pelanggan, mutasi poin (masuk/keluar) dengan keterangan. | S |
| PNT-03 | Katalog hadiah: nama, poin dibutuhkan, stok, foto, keterangan. | S |
| PNT-04 | Pengajuan penukaran + status pengajuan/pengambilan, foto bukti serah terima, nama penyerah. | S |
| PNT-05 | Penukaran mandiri dari aplikasi pelanggan dengan validasi stok & saldo. | C |

### 4.11 Keuangan & akuntansi

| ID | Requirement | P |
|---|---|---|
| FIN-01 | Bagan akun (COA): kode, nama, kategori, tipe, saldo. | M |
| FIN-02 | Pemasukan & pengeluaran: jenis, nominal, metode (kas/transfer), bukti, keterangan, petugas, waktu. | M |
| FIN-03 | Petty cash: alokasi dana, pemakaian, sisa, status pembayaran. | S |
| FIN-04 | Rembursment: pengajuan, approval, pembayaran. | S |
| FIN-05 | Payment request: pengajuan → require approval → unpaid → paid, dengan lampiran. | S |
| FIN-06 | Buku besar/mutasi: kredit, debit, saldo berjalan per rekening; ekspor. | M |
| FIN-07 | PO & penawaran harga: header, item, status, cetak PDF. | S |
| FIN-08 | Contact (vendor/karyawan/customer) dengan saldo. | S |
| FIN-09 | Laporan: laba rugi, arus kas, BHP/USO/fee ISP, pajak/e-Faktur. | S |

### 4.12 Laporan & dashboard

| ID | Requirement | P |
|---|---|---|
| RPT-01 | Dashboard peran: pemilik (pendapatan, margin), cabang (pelanggan, tagihan, setoran), sales (komisi, akuisisi), NOC (up/down, tiket). | M |
| RPT-02 | Laporan pelanggan baru, IPL, tagihan, pembayaran, tunggakan, prorate, isolir — dengan filter periode/lokasi. | M |
| RPT-03 | Laporan tiket: per status, jenis, teknisi, SLA. | M |
| RPT-04 | Laporan sales: akuisisi, pemasukan, insentif, setoran. | M |
| RPT-05 | Export Excel/PDF untuk semua laporan; penjadwalan kirim email. | S |
| RPT-06 | Grafik tren pemasukan/pengeluaran per bulan & tahun. | S |

### 4.13 Notifikasi, WhatsApp & Telegram

| ID | Requirement | P |
|---|---|---|
| NOTIF-01 | Template notifikasi (header, footer, tautan) per event: registrasi, tagihan terbit, pengingat, isolir, pembayaran diterima, tiket. | M |
| NOTIF-02 | Penjadwalan: tanggal/waktu kirim relatif terhadap jatuh tempo. | M |
| NOTIF-03 | Blast tersegmentasi: semua, per lokasi, per paket, belum lunas, pelanggan tertentu. | M |
| NOTIF-04 | Multi-gateway WA (rotasi device, health), fallback email; log sent/outbox/fail/in + retry. | M |
| NOTIF-05 | Telegram untuk tiket & monitoring (group ID per perusahaan). | S |
| NOTIF-06 | Opt-out/persetujuan pelanggan & jam tenang (tidak kirim malam). | S |

### 4.14 Kemitraan

| ID | Requirement | P |
|---|---|---|
| MITRA-01 | Dashboard mitra: jumlah pelanggan, lunas/belum, pemasukan PPN/non-PPN. | S |
| MITRA-02 | Perhitungan BHP 1,25%, USO 0,5%, fee ISP — dapat dikonfigurasi. | S |
| MITRA-03 | Dokumen kemitraan (unggah, tautan, riwayat). | C |

### 4.15 Pengaturan sistem

| ID | Requirement | P |
|---|---|---|
| SYS-01 | Profil perusahaan: nama, logo, alamat, kontak, TTD, periode tagihan, BHP/USO/fee, QR registrasi. | M |
| SYS-02 | Manajemen user & role (24 level → role kanonik), reset password, nonaktifkan. | M |
| SYS-03 | Mail server SMTP (kredensial terenkripsi) + tes kirim. | M |
| SYS-04 | Payment gateway: metode, kredensial, status, beban biaya. | S |
| SYS-05 | Banner aplikasi & info update APK. | C |
| SYS-06 | Log aktivitas & log integrasi (bisa difilter tanggal/user). | M |
| SYS-07 | Dokumentasi API internal (OpenAPI) untuk integrasi. | S |

---

## 5. Aturan bisnis

1. **Jatuh tempo** ditentukan per pelanggan (tanggal 1–31) dan dipakai untuk pengingat, isolir, dan laporan. Tanggal > jumlah hari bulan berjalan dipangkas ke hari terakhir.
2. **PPN** dihitung dari harga paket setelah diskon. Bila `ppn = Tidak`, invoice tidak menampilkan PPN.
3. **Prorate** hanya untuk pelanggan baru pada bulan registrasi; tidak berlaku untuk paket "Tidak Wajib Tiap Bulan".
4. **Diskon** diterapkan sebelum PPN. Diskon persentase dihitung dari harga paket, bukan dari total tagihan.
5. **Insentif sales** dihitung dari pemasukan yang sudah **disetor** (bukan dari tagihan terbit), dengan metode persentase atau nominal per paket/lokasi.
6. **Isolir** hanya untuk pelanggan `jns_blokir = Otomatis`; pelanggan `Manual` perlu tindakan admin.
7. **Pembayaran kurang bayar** tidak mengubah status menjadi lunas sampai total terpenuhi.
8. **Setoran sales** wajib sebelum insentif dicairkan.
9. **Payroll** memakai cut-off, bukan bulan kalender; absensi di luar cut-off masuk periode berikutnya.
10. **Lembur** harus disetujui sebelum masuk payroll.
11. **Poin** diberikan setelah pembayaran terverifikasi, bukan saat tagihan terbit.
12. **Voucher** mengurangi stok saat digenerate, bukan saat terjual; voucher hangus tetap dihitung sebagai kerugian.
13. **BHP/USO/fee ISP** dihitung dari pemasukan setelah dikurangi PPN (sesuai label kolom existing).

---

## 6. Model data

Ringkas (lengkap di `erd.md`):

- **Inti**: `warga` (pelanggan + staf, 24 level) → `lokasi`, `router`, `tipe_pembayaran`
- **Billing**: `langganan`, `tagihan`, `pembayaran`, `deposit`, `diskon`, `rekening`
- **Jaringan**: `olt`, `perangkat_pasif` (ODP/ODC), `tiang`, `antena`, `tunnel`, `genieacs`, `perangkat` (inventaris)
- **Layanan**: `ticket`, `ticket_detail`, `installasi`, `berita_acara`
- **SDM**: `master_gaji`, `shift`, `absensi`, `lembur`, `cuti`, `tunjangan`, `pemotongan`, `piutang_karyawan`, `payroll_periode`, `gaji_bulanan`
- **Keuangan**: `akun`, `kategori_akun`, `mutasi`, `pemasukan`, `pengeluaran`, `setor`, `petty_cash`, `rembursment`, `payment_request`, `contact`, `po`
- **Growth**: `voucher_harga`, `voucher_item`, `penjualan_voucher`, `setor_voucher`, `poin_*`
- **Messaging**: `notifikasi_template`, `wa_*`, `telegram_group`, `mail_server`

**Perubahan skema yang direkomendasikan** (dari temuan RE):

| Temuan existing | Rekomendasi |
|---|---|
| `warga` untuk 24 role | Pisahkan `users` (akun login) dan `customers`; `staff` sebagai profil 1:1 user |
| 67 field di satu form | Pecah: `customer_profile`, `customer_address`, `customer_network`, `subscription` |
| 7 slot `id_router1..6`, `usersecret`, `usersecret2` | Tabel `customer_network_service` (1:N, jenis layanan) |
| `password` plaintext | Hash untuk akun; secret store untuk perangkat |
| `id pelanggan` & `nominal pemasukan` (spasi) | snake_case konsisten |
| `nama_lokasi`, `nama_sales` didenormalisasi | Join / materialized view |
| Enum string bebas | Tabel referensi / CHECK constraint |
| `del-*` tanpa jejak | Soft delete + audit trail |

---

## 7. Integrasi eksternal

| Integrasi | Protokol | Kebutuhan |
|---|---|---|
| MikroTik RouterOS | API (`ip:portapi`), SSH | provisioning PPPoE/hotspot/static, queue, cek sesi, isolir, backup config |
| OLT (ZTE/Huawei/HSGQ/Hioso/C-DATA) | Telnet + SNMP | daftar ONU, status, redaman, environment monitoring |
| GenieACS | REST (TR-069) | inventaris CPE, status online, reboot |
| WhatsApp Gateway | HTTP API (WAGW) | kirim pesan, status device, log |
| Telegram Bot | Bot API | notifikasi tiket & monitoring |
| SMTP | SMTP/TLS | email invoice & notifikasi |
| Payment Gateway | Xendit/Tripay/Moota/Duitku/PakarDigital | pembuatan transaksi, callback, rekonsiliasi |
| PPOB | API pihak ketiga | pembelian produk, saldo, laporan |
| API Service internal | REST (documented at `api-service.ebilling.id`) | integrasi aplikasi pelanggan |
| Mesin absensi | (belum teridentifikasi) | data absensi |

Prinsip: semua integrasi lewat **adapter** dengan retry, timeout, circuit breaker, dan log; tidak ada kredensial di kode/klien.

---

## 8. Non-functional requirements

| Kategori | Requirement |
|---|---|
| Keamanan | CSRF token di semua form; CSP; validasi server-side; rate limit login (5/menit) & API; enkripsi secret; masking nominal sensitif; audit log immutable; dependency scanning. |
| Kinerja | Daftar 10.000 pelanggan: halaman pertama < 1,5 s (server-side pagination + index). Generate tagihan 10.000 pelanggan < 5 menit (batch + queue). Dashboard agregat < 2 s (pre-agregasi). |
| Skalabilitas | Target awal 100.000 pelanggan, 50 tenant/lokasi, 1.000 tiket/bulan. |
| Ketersediaan | 99,5% bulanan untuk billing; job billing/isolir harus idempoten & bisa diulang. |
| Audit & retensi | Audit 2 tahun; log integrasi 90 hari; data keuangan 10 tahun (kebutuhan pajak). |
| Privasi | Data KTP & foto hanya untuk role berwenang; akses file via signed URL; enkripsi at-rest. |
| Kompatibilitas | API publik versi `/v1`, tidak memutus integrasi aplikasi pelanggan existing. |
| Observabilitas | Metrics (billing job, integrasi, error rate), structured log, alert. |
| Aksesibilitas/UX | Responsif mobile untuk teknisi (input tiket & foto dari lapangan). |
| Operasional | Backup harian + PITR; runbook restore; feature flag untuk rollout. |

---

## 9. Migrasi dari sistem existing

1. **Inventaris data**: ekspor semua tabel via modul export existing (pelanggan, pembayaran, tagihan, tiket, perangkat).
2. **Pemetaan**: 1 `warga` → `users` + `customers` + `staff` berdasarkan `level`; kolom `jns_*` → tabel referensi.
3. **Pembersihan**:
   - Password plaintext → paksa reset (jangan migrasi apa adanya).
   - Duplikasi nama/HP/NIK → laporan konflik, keputusan manual.
   - Field berspasi & typo (`ketarangan`, `hadian`) → mapping eksplisit.
   - ID base64 → id numerik internal baru + redirect URL lama (opsional).
4. **Dual-run**: 1–2 siklus billing berjalan paralel; rekonsiliasi otomatis jumlah tagihan & pembayaran.
5. **Cut-over**: hentikan input di sistem lama, migrasi delta, aktifkan sistem baru, simpan sistem lama read-only 6 bulan.
6. **Verifikasi**: uji 100 pelanggan sampel (acak per lokasi) — total tagihan, sisa saldo, status isolir harus identik.

---

## 10. Roadmap & prioritas

| Fase | Fokus | Modul | Estimasi kasar |
|---|---|---|---|
| 0 | Fondasi | auth, RBAC, tenant/lokasi, audit, profil perusahaan | 3–4 minggu |
| 1 | Pelanggan & billing | master pelanggan (wizard), paket, prorate, PPN, diskon, tagihan, pembayaran, kuitansi | 6–8 minggu |
| 2 | Jaringan | router, OLT, ODP/ODC, tiang, provisioning, isolir, monitoring | 6–8 minggu |
| 3 | Layanan | ticket, jadwal, berita acara, inventaris perangkat | 5–6 minggu |
| 4 | Keuangan & growth | pemasukan/pengeluaran, setoran, voucher, poin, payment gateway | 5–7 minggu |
| 5 | SDM | absensi, cuti, lembur, payroll | 4–6 minggu |
| 6 | Akuntansi & mitra | COA, petty cash, payment request, laporan, kemitraan | 4–6 minggu |
| 7 | Otomasi | notifikasi, WA/Telegram, scheduler isolir, rekonsiliasi | 3–4 minggu |

Urutan ini mengikuti ketergantungan data: pelanggan → langganan → tagihan → pembayaran → isolir; dan ticket butuh pelanggan + perangkat.

**Cut scope v1 (Won't)**: PPOB, e-Faktur otomatis, aplikasi mobile native, machine learning, portal mitra self-service penuh.

---

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perilaku bisnis implisit tidak terlihat dari UI | Fitur klon salah hitung (prorate, insentif) | Validasi dengan 1 siklus billing nyata + wawancara admin |
| Integrasi perangkat beragam vendor | Provisioning gagal di lapangan | Adapter per vendor + fallback manual + mode dry-run |
| Data lama kotor (plaintext, duplikat) | Migrasi tertunda | Profiling data lebih awal, aturan konflik eksplisit |
| Scope 247 modul terlalu besar | Proyek tidak selesai | Phased release, cut scope v1, modul C ditunda |
| Ketergantungan scheduler (isolir, tagihan) | Salah isolir massal | Idempotensi, dry-run, batas maksimum aksi massal, approval |
| Regulasi data pribadi (KTP, foto) | Risiko hukum | Enkripsi, akses berbasis role, retensi, audit |
| Otorisasi tidak konsisten (terbukti di sistem existing) | Kebocoran data gaji & takeover akun | AUTH-08..11 wajib sebelum go-live; uji penetrasi role rendah |

---

## 12. Keputusan yang masih terbuka

1. **Stack**: PHP/Laravel vs Node/TypeScript vs lain — **ditunda** sesuai arahan. PRD ini stack-agnostic; keputusan mempengaruhi §8 dan §10.
2. **Multi-tenant**: satu instalasi untuk banyak perusahaan (account 6121 tampak seperti tenant) atau satu instalasi per ISP?
3. **Cakupan akuntansi**: cukup kas/buku besar (existing) atau double-entry penuh?
4. **Aplikasi pelanggan**: pertahankan APK existing (Playstore User) atau bangun web app pelanggan?
5. **Kebijakan isolir**: otomatis penuh atau butuh approval admin per batch?
6. **PPOB**: dipertahankan atau dipisah ke produk lain?
7. **Retensi & kepemilikan data** hasil reverse engineering ini.

---

## 13. Batasan riset (penting)

- Semua temuan berasal dari **HTML yang dirender server**; tidak ada akses kode sumber, database, atau logika backend.
- **Hanya 3 role** yang diuji (Administrator, CS, Teknisi). Matriks akses untuk Sales/HRD/Reseller/NOC/Mitra adalah target desain, bukan hasil verifikasi. Rincian di `rbac.md`.
- Ditemukan **celah otorisasi nyata** pada sistem existing: CS dapat membuka form edit user Administrator dengan password plaintext, serta halaman payroll & finance. Tidak ada aksi yang dieksekusi untuk mengeksploitasi temuan ini.
- Halaman aksi (`del-*`, `kirim-*`, `migrasi-*`, `update-*`, `test-*`, `jual-*`) **tidak diakses** karena bisa mengubah data/mengirim pesan.
- 14 modul mengembalikan halaman kosong dan belum bisa dianalisis (lihat `erd.md` §5).
- Perhitungan (prorate, PPN, insentif, BHP/USO) disimpulkan dari nama kolom & label, **belum diverifikasi dengan angka nyata**.
- Kredensial perangkat/pelanggan yang muncul di UI tidak dimuat ke dokumen ini.

---

## 14. Glosarium

| Istilah | Arti |
|---|---|
| IPL | Iuran Perbulan Langganan (tagihan bulanan) |
| Prorate | Perhitungan biaya proporsional untuk bulan pertama |
| Isolir | Pemblokiran layanan karena tunggakan |
| ODP/ODC | Optical Distribution Point / Cabinet (jaringan FTTH) |
| ONU | Optical Network Unit (perangkat di sisi pelanggan) |
| GenieACS | Auto Configuration Server TR-069 |
| BHP | Biaya Hak Penyelenggaraan (kewajiban ke negara) |
| USO | Universal Service Obligation |
| WAGW | WhatsApp Gateway |
| STO | Sentral Telepon Otomat (wilayah layanan) |
| PO | Purchase Order |
| COA | Chart of Accounts |
