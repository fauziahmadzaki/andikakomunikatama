# Alur Bisnis & State Machine

Semua alur direkonstruksi dari halaman, form, tombol, dan enum yang ditemukan. Bagian yang diasumsikan ditandai *(asumsi)*.

---

## 1. Siklus hidup pelanggan

```mermaid
stateDiagram-v2
    [*] --> Survey: jns_pelanggan = "Pelanggan Survey"
    Survey --> Baru: survey disetujui
    [*] --> Baru: jns_pelanggan = "Pelanggan Baru"
    Baru --> Aktif: provisioning selesai + status=Aktif
    [*] --> Lama: jns_pelanggan = "Pelanggan Lama"
    Lama --> Aktif: migrasi data
    Aktif --> TidakAktif: status="Tidak Aktif" / nonaktifkan data
    TidakAktif --> Aktif: reaktivasi
    Aktif --> Isolir: tunggakan melewati jatuh tempo
    Isolir --> Aktif: pembayaran diterima
    Aktif --> [*]: deaktivasi / dismentle
```

Bukti: `jns_pelanggan` (3 nilai) di `add-warga`; tombol **Nonaktifkan Data** dan halaman `data-pelanggan-tidak-aktif`; `data-isolir` (Static/PPPOE/Hotspot); `data-warga-status-koneksi` (Up/Down/Null).

**Aturan penomoran**: `id_pelanggan` diisi manual pada form (placeholder `id_pelanggan`), bukan auto-generate. Ada utilitas **Kode Unik** dan **Update KTP** massal.

---

## 2. Provisioning layanan

```mermaid
sequenceDiagram
    participant Admin
    participant App
    participant Router as MikroTik
    participant OLT
    participant ACS as GenieACS
    Admin->>App: add-warga (data + paket + router)
    App->>Router: buat PPPoE secret / hotspot user / static queue
    Note over App,Router: field usersecret, profile,<br/>nama_queues, burst_limit, parent
    Admin->>App: add-odp (ODP/ODC + port + SN)
    App->>OLT: daftarkan ONU (modul_olt, olt_port, index_onu, sn_onu)
    OLT-->>App: status ONU
    App->>ACS: binding perangkat (opsional)
    App-->>Admin: pelanggan aktif
```

Bukti: `add-warga` memuat 17 field khusus MikroTik (7 slot router, `usersecret`, `profile`, `parent`, `burst_limit`, `nama_queues`) dan 5 field OLT/ONU; `data-odp` menyimpan relasi OLT/ODC/tiang/port; `data-genieacs-server` untuk TR-069; `data-installasi` menggabungkan pelanggan + OLT + ODP + ODC.

**Mode pembuatan** (`metode_pembuatan`): `Buat Baru` (provision dari app), `Sinkronisasi` (tarik dari router), `Manual`.

---

## 3. Siklus tagihan → pembayaran → setoran

```mermaid
stateDiagram-v2
    [*] --> TagihanTerbit: generate tagihan bulanan / add-tagihan
    TagihanTerbit --> Prorate: pelanggan baru (prorate=YA)
    Prorate --> TagihanTerbit: nominal prorate dihitung
    TagihanTerbit --> Lunas: pembayaran dicatat (data-ipl)
    TagihanTerbit --> KurangBayar: nominal_pembayaran < nominal_harus_dibayar
    KurangBayar --> Lunas: pelunasan
    TagihanTerbit --> BelumLunas: melewati jatuh tempo
    BelumLunas --> Isolir: jns_blokir = Otomatis
    Lunas --> [*]
```

Sub-alur setoran (tunai dari sales):

```mermaid
stateDiagram-v2
    [*] --> BelumSetor: pembayaran Cash oleh sales
    BelumSetor --> SudahSetor: data-setor / verifikasi admin
    SudahSetor --> [*]
    note right of BelumSetor
        status_setor terlihat di
        data-pemasukan-validasi
    end note
```

Bukti:
- `data-ipl`: `Nominal Harus Dibayar`, `Nominal Pembayaran`, `Status Pembayaran`, `Status Setor`, `Metode Pembayaran`, `Bukti Pembayaran`, `Periode Pembayaran`.
- `data-warga-kurang-bayar` (filter `tgl_jatuh_tempo`: 07/10/18/21/28 — jatuh tempo per tanggal klaster).
- `data-belum-bayar-prorate`: `Jumlah Hari Pemakaian` + `Nominal Pembayaran Prorate`.
- `data-setor`: rekap setoran per sales.
- `data-mutasi`: buku besar kredit/debit/saldo.
- `dashboard-income-summary`: rekap pemasukan per rekening/metode (Tunai, TRIPAY, XENDIT, MOOTA, PAKAR_DIGITAL, MESIN_OTOMATIS).

---

## 4. Diskon

```mermaid
flowchart LR
    A[add-diskon] --> T[Pelanggan tertentu]
    B[add-diskon-semua] --> S[Semua pelanggan]
    C[add-diskon-lokasi] --> L[Per lokasi]
    D[add-diskon-paket] --> P[Per paket]
    E[add-diskon-paket-lokasi] --> PL[Per paket + lokasi]
    T & S & L & P & PL --> F[metode: Presentase / Nominal]
    F --> G[Harga Setelah Diskon]
```

Bukti: 5 form tambah diskon + kolom `Nama Diskon`, `Metode Diskon`, `Nominal Diskon`, `Harga Setelah Diskon`; tombol **Hapus Data Diskon Semua Pelanggan**. Diskon juga bisa menempel langsung ke tagihan manual (`add-tagihan` punya `jns_diskon`, `nominal_diskon`).

---

## 5. Deposit

Alur dua langkah: **pilih pelanggan** (`add-deposit-pelanggan&kode=1`) → form deposit. Dipakai untuk pembayaran di muka; tercatat sebagai `data-deposit-pelanggan` dengan status pembayaran, bukti, periode, dan metode.

---

## 6. Ticket / laporan pelanggan

```mermaid
stateDiagram-v2
    [*] --> Open
    Open --> DalamPenanganan: teknisi mengambil
    Open --> Pending: menunggu pihak ketiga
    Open --> JadwalPemasangan: jadwal disepakati
    JadwalPemasangan --> PemasanganBerhasil: pemasangan sukses
    JadwalPemasangan --> PemasanganGagal: pemasangan gagal
    PemasanganBerhasil --> Closed
    PemasanganGagal --> Closed
    DalamPenanganan --> Closed: selesai + aksi_perbaikan
    Pending --> DalamPenanganan: lanjut
    Closed --> [*]
    note right of Open
        Ada juga status
        "Permintaan Aktivasi"
    end note
```

Bukti: 8 status pada `edit-laporan-pelanggan-`; halaman terpisah per status (`open`, `pending`, `dalam-penanganan`, `closed`, `aktivasi`, `jadwal-pemasangan`); 20 jenis laporan (`jns_laporan`); field `kendala`, `aksi_perbaikan`, `foto`, `durasi`, dua teknisi (`id_teknisi5`, `id_teknisi6`); riwayat update tersimpan dengan `waktu_update` (tabel `TICKET_DETAIL`); `data-laporan-pelanggan-berita-acara` untuk BA pemasangan.

Jalur **Ticket General** terpisah (`add-laporan-general-`), tanpa pelanggan spesifik (`id_warga` = General/Project).

---

## 7. Payroll

```mermaid
flowchart TD
    A[Master Gaji Karyawan<br/>gaji pokok, tunjangan, shift, hak cuti] --> B[Absensi harian<br/>masuk/pulang + foto + GPS]
    B --> C[Rekap Absensi<br/>telat/izin/cuti/alpha]
    A --> D[Lembur<br/>total per jam]
    C & D --> E[Cut Off Penggajian<br/>tgl mulai - tgl akhir]
    E --> F[Data Gaji Karyawan<br/>gaji kotor]
    G[Tunjangan] --> F
    H[Pemotongan] --> F
    I[Piutang Karyawan] --> F
    F --> J[Gaji bersih]
    J --> K[Pengeluaran / pembayaran gaji]
```

Bukti: `data-gaji-karyawan` (20 kolom: hari kerja, izin, cuti, absen, tunjangan transport/makan, lembur, lain-lain, gaji kotor, pemotongan, gaji), `edit-cut-off-penggajian` (tgl mulai/akhir, bulan sama/berikutnya), `data-master-gaji-karyawan` (gaji pokok, tunjangan per hari, nominal lembur/jam, hak & sisa cuti), `data-absensi-karyawan` (shift, telat, durasi, foto, maps, jarak, max jarak), `data-lembur-karyawan` (checklist + **Setujui Terpilih**), `data-tunjangan`, `data-pemotongan`, `data-piutang-karyawan`.

Geofence absensi: `titik_koordinat_absensi_masuk/pulang` + `max_jarak` + `jarak` aktual.

---

## 8. Voucher & reseller

```mermaid
flowchart LR
    A[Harga Voucher<br/>harga jual/beli, profile, script login] --> B[Generate Voucher<br/>username/password]
    B --> C[Voucher Item<br/>status belum terjual]
    C --> D[Penjualan Voucher<br/>reseller / mandiri]
    D --> E[Keuntungan Reseller]
    E --> F[Setor Voucher ke Admin]
```

Bukti: `data-harga-voucher` (Nama, Harga Jual, Harga Beli, Profile, Lokasi, Router, Script On Login), `data-pemasukan-voucher` (username, password, waktu jual, bytes in/out, status), `data-setor-voucher-admin`, `data-user-reseller` (Level + Server Akses + Jumlah Stock Voucher), `jual-voucher-admin`, `dashboard-penjualan-voucher-mandiri`, `cek-voucher`.

Voucher terhubung ke MikroTik hotspot (`profile`, `script_on_login`) → penjualan memicu pembuatan user hotspot.

---

## 9. Poin pelanggan

`Pengaturan Poin` (ketentuan poin, mis. per pembayaran) → saldo poin pelanggan → `Pengaturan Hadiah` (stok) → `Pengajuan Penukaran` (status pengajuan + status pengambilan + foto + nama penyerah). Halaman penukaran untuk sisi pelanggan: `data-penukaran-hadiah-poin`.

---

## 10. Notifikasi & WhatsApp

```mermaid
flowchart LR
    A[Template Notifikasi<br/>header, footer, link] --> B[Penjadwalan<br/>tgl + waktu + tipe]
    B --> C[Target: pelanggan / belum lunas / per lokasi]
    C --> D[WA Gateway / Push / Email]
    D --> E[Log: sent / outbox / fail / in]
```

Bukti: 15 template di `data-notifikasi`; `setting-push-notifikasi`; `data-wa` (WAGW server, 7 server, status Disconnected); `data-sent`, `data-outbox`, `data-fail`, `data-in`, `data-group`, `data-group-telegram`, `data-api-whatsapp-gateway`, `data-virtual-assistant`, `edit-mail-server` (SMTP); `data-blast`; `kirim-tagihan-belum-bayar-multi-manual` (endpoint kirim massal, tidak dieksekusi).

---

## 11. RBAC (24 level)

| Kelompok | Level |
|---|---|
| Pemilik / pusat | Administrator, Investor, Investor Cabang, Admin Pusat |
| Manajemen | Kepala Cabang, Kepala Sales, Kepala Sales Cabang, Kepala Teknisi, Kepala Teknisi Cabang, HRD |
| Operasional | Admin Lokasi, Admin Cabang, Admin Gudang, NOC, CS, CS Cabang |
| Lapangan | Sales, Teknisi, Teknisi Lokasi, Teknisi Cabang |
| Mitra | Reseller, Agen, Karyawan, Playstore User |

Menu yang tampil kemungkinan difilter per level (sidebar pada akun Administrator menampilkan semua). Detail matriks akses per level **belum** diverifikasi — perlu login sebagai role lain.

---

## 12. Isolir & status koneksi

- `data-isolir` menampilkan tab **Static / PPPOE / Hotspot** → isolir dilakukan per jenis koneksi.
- `data-warga-status-koneksi` memfilter `status_koneksi` = `Up` / `Down` / `Null`.
- `data-warga` punya aksi massal **Nonaktifkan Data** dan **Bayar Sekarang**.
- `validasi-status-langganan` (endpoint aksi, tidak dieksekusi) mengindikasikan sinkronisasi status On/Off antara app dan router.

*(asumsi)* Isolir otomatis dijalankan scheduler berdasarkan `tgl_jatuh_tempo` + `status_pembayaran` + `jns_blokir=Otomatis`.
