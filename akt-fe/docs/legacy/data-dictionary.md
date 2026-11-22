# Kamus Data (hasil ekstraksi otomatis)

Diturunkan dari HTML halaman: kolom tabel + field form (nama:tipe, `*` = required, `{n}` = jumlah opsi select).
Ini **bukti mentah**, bukan skema final. Interpretasi ada di `erd.md`.


## Dashboard & Monitoring

### `dashboard-absensi`

Judul: Absensi Karyawan Hari Ini

Tombol/aksi: ' + ' Muat Ulang' + '

### `dashboard-all-olt-new`

Judul: Dashboard All OLT

Tabel 1 (1 baris): OLT | Status | Progress | ONU | Waiting Auth | Pesan

Tabel 2 (15 baris): No ↕ | Nama OLT ↕ | ID ONU ↕ | Nama ↕ | Status ↕ | Serial Number ↕ | ONU Rx ↕ | OLT Rx ↕ | Distance ↕ | Updated ↕

Tabel 3 (1 baris): T-CONT | GEMPORT | Service Port | VLAN | Raw

Tabel 4 (1 baris): WAN | Service | Mode | GEMPORT | IP Host | VLAN | Binding

Tabel 5 (2 baris): No | OLT | Index/PON | Serial Number | ONU Type | Aksi

Tombol/aksi: Scan Cepat Semua OLT · Stop Scan · Refresh Tampilan · Previous · Next · × · Refresh WAN · Reboot · Reset · Hapus · Lihat Konfig · Stop · Tutup · Refresh Waiting Auth

### `dashboard-cabang`

Judul: Data Cabang October 2026

Tabel 1 (4 baris): Aksi | No | Nama Cabang | Jumlah Pelanggan | Jumlah Pelanggan Baru | Jumlah Pelanggan Free | Pelanggan Lunas | Pelanggan Belum Lunas | Total Pemasukan Bulan Ini | Pengeluaran Bulan Ini | Balance Bulan Ini | Metode Insentif | Insentif | Total Insentif Bulan Ini | Total Diskon | Total Estimasi Sebelum Diskon | Total Estimasi Setelah Diskon | Aksi

Tabel 2: Total Pelanggan | Total Pelanggan Baru | Total Pelanggan Free | Total Pemasukan Bulan ini | Total Pengeluaran Bulan ini | Balance Bulan ini | Total Diskon Keseluruhan Lokasi | Total Estimasi Pemasukan Sebelum Diskon | Total Estimasi Pemasukan Setelah Diskon

Form 1 [post (self)]: bulan:text*

### `dashboard-cabang-voucher`

Judul: Data Pendapatan Voucher Perlokasi

Tabel 1 (1 baris): No | Nama Lokasi | Jumlah Voucher Terjual | Total Pemasukan Bulan Ini

Tabel 2: Total Voucher Terjual | Total Pemasukan Bulan ini

### `dashboard-corporate`

### `dashboard-income-summary`

Judul: Income Summary October 2026 · Data Detail Transaksi

Tabel 1: No | ID Pelanggan | Nama Pelanggan | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | Lokasi | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Waktu Entry | Keterangan | Metode Insentif | Insentif | Nominal Insentif

Tabel 2 (14 baris): Pemasukan Langganan Cash

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `dashboard-mitra`

Judul: Dashboard Mitra PT.ANDIKA KOMUNIKA TAMA Bulan October 2026

Tabel 1: Aksi | No | No Account | Expired | Nama Mitra | Nama PIC | Alamat | Jumlah Pelanggan | Pelanggan Lunas | Pelanggan Belum Lunas | Total Pelanggan PPN dan Nominal | Total Pelanggan Non PPN dan Nominal | Total Pemasukan PPN Bulan Ini | Total Pemasukan Non PPN Bulan Ini | Total Pemasukan Bulan Ini | Pengaturan BHP | BHP 1,25% (Pelanggan PPN,Setelah Dikurangi PPN) | Pengaturan USO | USO 0,5% (Pelanggan PPN,Setelah Dikurangi PPN) | Total Pemasukan Setelah PPN,BHP,USO | Pengaturan Fee Ke ISP | Total Fee ke ISP(Setelah dikurangi PPN dan BHP,USO) | Total Estimasi Pemasukan Bulan Ini | Aksi

Tabel 2: Total Seluruh Pelanggan Mitra | Total BHP | Total USO | Total Fee ISP Yang Didapat | Total Pemasukan Mitra Bulan ini | Total Estimasi Pemasukan Mitra Bulan ini

Form 1 [post (self)]: bulan:text*

### `dashboard-monitoring`

Judul: Dashboard Monitoring

### `dashboard-pelanggan-baru`

### `dashboard-penggajian`

### `dashboard-penjualan-voucher-mandiri`

### `dashboard-perangkat`

Judul: Dashboard Inventaris

Tabel 1 (1 baris): Waktu | Referensi | Transaksi | Barang | Qty | Status

### `dashboard-pppob`

### `dashboard-reguler`

### `dashboard-reseller`

Judul: Dashboard Reseller

Tabel 1 (1 baris): Aksi | No | Nama Reseller | Jenis Deposit | Total Penjualan Reseller | Total Keuntungan Reseller | Penjualan Reseller Bulan ini | Keuntungan Reseller Bulan ini | Total Yang Sudah Di Setor | Total Deposit | Total Yang Harus Di Setor / Sisa Deposit | Aksi

Tabel 2: Total Penjualan | Total Yang Harus di Setor

Form 1 [post (self)]: bulan:text*

### `dashboard-sales`

Tabel 1: Aksi | No | Nama Sales | Alamat | Jumlah Pelanggan | Pelanggan Lunas | Pelanggan Belum Lunas | Total Pemasukan Bulan Ini | Total Pengeluaran Bulan Ini | Total Insentif Bulan Ini | Balance Bulan Ini | Total Pemasukan Cash Bulan Ini | Total Pemasukan Transfer Bulan Ini | Total Dana Cash Yang Sudah Disetor Bulan Ini | Total Dana Cash Yang Belum Disetor Bulan Ini | Total Estimasi Pemasukan Bulan Ini | Total Estimasi Insentif Bulan Ini | Total Estimasi Pendapatan Bersih Bulan Ini | Aksi

Form 1 [post (self)]: bulan:text*

Tombol/aksi: Pilih · - Zoom · Reset · + Zoom · < · > · ' + monthNames[i - 1] + '

### `dashboard-tagihan`

### `dashboard-ticket-general`

Judul: Ticket General

### `dashboard-ticket-pelanggan`

Judul: Ticket Pelanggan

### `dashboard-voucher`

### `data-grafik`

Judul: Data Grafik Pemasukan Dan Pengeluaran · Data Grafik Perbandingan Tren Transaksi · Data Grafik Penambahan Pelanggan · Data Grafik Pemasangan Sales · Data Grafik Ticket · Data Grafik Ticket Closed Teknisi 2026 · Data Grafik Ticket Ringkasan Pelanggan 2026 · Data Grafik Jenis Ticket 2026

Tombol/aksi: Pilih

### `data-grafik-corporate`

Judul: Data Grafik Absensi Karyawan Per Bulan · Grafik Pie Absensi Karyawan Per Bulan · Absensi Summary Karyawan · Data Lembur Karyawan · Data Tunjangan Karyawan · Data Piutang Karyawan · Data Gaji Karyawan

Tombol/aksi: Tampilkan Grafik

### `data-group-monitoring`

Judul: Data Group ID

Tabel 1: No | ID Group | Nama Group

### `data-ip`

Judul: Data IP Address · Informasi IP: Loading...

Tabel 1 (4 baris): IP Address

### `data-map-karyawan`

Judul: Data Mapping Karyawan

Form 1 [post (self)]: q:text*

Tombol/aksi: Cari

### `data-map-odc`

Judul: Data Mapping ODC

Form 1 [post (self)]: q:text*

Tombol/aksi: Cari

### `data-map-odp`

Judul: Data Mapping Pelanggan

Tabel 1 (1 baris): No | ID ODP | Nama ODP | Max Pelanggan | Total | On / Up | Off / Down | Belum Diketahui

Form 1 [post (self)]: q:text*

Tombol/aksi: Semua (59) · 🟢 Up (31) · 🔴 Down (27) · 🟠 Belum Diketahui (1) · Export Excel · Cari

### `data-map-odp-terdekat`

Judul: Data Mapping ODP Terdekat · HASIL PENCARIAN ODP TERDEKAT · -

Tabel 1 (1 baris): No | Jarak | ID ODP | Nama ODP | Total Slot | Terpakai | Tersedia | Up | Down | Unknown | Aksi

Tabel 2 (1 baris): No | Jarak | ID ODP | Nama ODP | Total Slot | Terpakai | Tersedia | Up | Down | Unknown

Tabel 3 (1 baris): Host | IP | MAC Address | Status | Aksi

Form 1 [get javascript:void(0);]: koordinat:text

Tombol/aksi: Semua · 🟢 Up · 🔴 Down · 🟠 Unknown · 🏠 Pelanggan · 🧱 Infrastruktur · 🟨 ODP · ⬛ Tiang · 🟪 ODC · 🟦 OLT · 🔒 Read Only · 📍 Geser Titik · 🧩 Ubah Instalasi · 🟨 ODP/OTB/SWITCH → Tiang · ➕ Tambah Data · Cari · 📍 Saat Ini · Ambil Koordinat · Export Excel · Bersihkan · × · " + " × Hapus Koneksi Instalasi" + " · " + "Simpan Data Instalasi" + " · Lihat · &times;

### `data-map-olt`

Judul: Data Mapping OLT

### `data-map-pelanggan-`

Judul: Data Mapping Pelanggan · Google Maps belum dimuat

Tabel 1 (1 baris): Host | IP | MAC Address | Status | Aksi

Form 1 [get javascript:void(0);]: q:text

Tombol/aksi: Semua · 🟢 Up · 🔴 Down · 🟠 Unknown · 📡 Lokasi Saya · 🏠 Pelanggan · 🧱 Infrastruktur · 🟨 ODP · ⬛ Tiang · 🟪 ODC · 🟦 OLT · 🔒 Read Only · 📍 Geser Titik · 🧩 Ubah Instalasi · 🟨 ODP/OTB/SWITCH → Tiang · ➕ Tambah Data · Tandai · × · " + " × Hapus Koneksi Instalasi" + " · " + "Simpan Data Instalasi" + " · &times; · Kick · Simpan SSID / Password via ACS · Ya, Restart ONT Sekarang · Batal

### `data-map-tiang`

Judul: Data Mapping ODC

### `data-mapping`

### `data-monitoring-pppoe`

### `data-monitoring-static`

### `data-olt-new`

Judul: Data OLT · Vendor / Model OLT · Environment Monitoring OLT · OLT Configurations

Tabel 1 (2 baris): No | Nama OLT | Nama Lokasi | Host | Vendor / Model | Port Akses | SNMP | Status Akses | Status SNMP | Aksi

Tabel 2 (1 baris): Sensor | Type | Status | Current | Minimum | Maximum | Average | Terakhir

Tabel 3 (1 baris): '+esc(c.label)+'

Tabel 4 (1 baris): Nama Profile | Interface | VLAN | SSID | Update | Aksi

Tabel 5 (1 baris): Nama Profile | VLAN | Priority | ACS URL | Update | Aksi

Tombol/aksi: &times; · Batal · Simpan Vendor / Model · 24 Jam · 7 Hari · 30 Hari · Refresh Grafik · Ambil Data Sekarang · Ambil Snapshot Graph · OLT · Uplink · PON · Traffic · Signal · Save Config · Cek OLT · Refresh Realtime · Ringkasan · PON Cards · VLAN · ONU Type · WAN-IP Profiles · Speed Profiles · Profile WiFi · Profile ACS

### `data-ping`

Judul: Monitoring Ping Mikrotik

Tabel 1 (2 baris): No | Status | Nama Target | IP / Host | Router | Status Router | Sent | Received | Loss | Min | Avg | Max | Waktu | Aksi

Tombol/aksi: Reset Filter

### `data-session-hostpot`

Judul: Data Session Hotspot

Tabel 1: Aksi | ID Pelanggan | Server | User | Router | Waktu Mulai Session | IP Address | Bandwith In Out | Aksi

Form 1 [post (self)]: id_router:select{4} = Pilih Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK

### `data-session-ppoe`

Judul: Data Router

Tabel 1 (3 baris): No | Nama Router | Ip Address | Lokasi | Aksi

### `data-user-hotspot`

Judul: Data Router

Tabel 1 (3 baris): No | Nama Router | Ip Address | Lokasi | Aksi

### `data-user-pppoe`

Judul: Data Router

Tabel 1 (3 baris): No | Nama Router | Ip Address | Lokasi | Aksi

### `data-user-static`

Judul: Data Router

Tabel 1 (3 baris): No | Nama Router | Ip Address | Lokasi | Aksi

### `data-wa`

### `data-wagw`

### `edit-server-wagw`

### `edit-wagw-server`

Judul: Ubah Data

Form 1 [post (self)]: server:select*{21}

### `summary-monitoring-pppoe`

Judul: Detail Data Sesuai Summary

Tabel 1 (1 baris): No | Nama Router | IP Router | Status Router | Total Secret | Active | Inactive | Disabled | Isolir Billing DB | Isolir Mikrotik | Gangguan | Tidak Ada Data | Terdata | Profile Terbanyak | Error | Aksi

Tabel 2 (1 baris): No | Aksi PPPOE | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Username | Password | Profile | Last Logout | Local Remote Address | Remote Remote Address | Status | Status Langganan | Pembayaran Terakhir | Router

Tombol/aksi: Reset Filter · ‹ Prev · ${i} · =pages?'disabled':''}>Next ›


## Pelanggan

### `data-belum-bayar`

Judul: Data Pelanggan Yang Belum Lunas October 2026

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Nama Langganan | Keterangan | Harga | Kode Unik | Pembayaran Terakhir | Nama Lokasi | Nama Router | Username | Status Langganan | Status | Tanggal Registrasi | Jatuh Tempo | Aksi

Tabel 2: Total

Form 1 [post (self)]: tgl_jatuh_tempo:select*{7}<br>id_lokasi:select*{6} = Pilih Lokasi / Semua Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK<br>id_router:select{5} = Pilih Router / Semua Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK

Tombol/aksi: Bayar Sekarang · Kirim Tagihan Sekarang · Blokir · Checklist Semua · Unchecklist Semua · Atur Kolom · Ringkas · Semua · Reset

### `data-belum-bayar-prorate`

Judul: Data Pelanggan Prorate Yang Belum Lunas October 2026

Tabel 1 (48 baris): Aksi | No | ID Pelanggan | Nama Warga | Alamat | Tlp | Nominal Langganan | Nominal Pembayaran Prorate | Nominal Lain Lain | Total Pembayaran | Status Pembayaran | Tanggal Registrasi | Jumlah Hari Pemakaian | Tanggal Jatuh Tempo | Aksi

Tabel 2: Total

Form 1 [post (self)]: id_lokasi:select*{6} = Pilih Lokasi / Semua Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK

### `data-blast`

Judul: Data Blast

Tabel 1: No | Judul | Waktu Emtry | Aksi

### `data-installasi`

Judul: Data Installasi

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | No ID Identitas | Nama Langganan | Keterangan | Harga | Nama OLT | Nama ODP | Nama ODC | Aksi

### `data-isolir`

Judul: Data Isolir

Tabel 1 (1 baris): Static | PPPOE | Hotspot

### `data-kartu-warga`

Judul: Data Kartu Member Seluruh Pelanggan

Tabel 1: Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Username | Password | No ID Identitas | Nama Langganan | Keterangan | Harga | Catatan | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

Tombol/aksi: Copy Link

### `data-pelanggan-tidak-aktif`

Judul: Data Seluruh Tidak Aktif

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Email | No ID Identitas | Nama Langganan | Keterangan | Harga | Kode Unik | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Nama Onu | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

Tabel 2: Total

Tombol/aksi: Aktifkan Pelanggan · Buka Blokir · Blokir Langganan · Hapus Pelanggan · Checklist Semua · Unchecklist Semua

### `data-pengumuman`

Judul: Data Pengumuman

Tabel 1 (1 baris): No | Nama Pengumuman | Isi Pengumuman | Media | Filter | Aksi

### `data-poin-pelanggan`

Judul: Data Seluruh Poin Pelanggan

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | No ID Identitas | Nama Langganan | Keterangan | Harga | Poin | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

Form 1 [post (self)]: id_lokasi:select*{6} = Pilih Lokasi / Semua Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK

### `data-status-langganan`

Judul: Data Status Langganan

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | ID Tipe Pembayaran | Nama Langganan | Harga | Lokasi | ID Router | Nama Router | Jenis Koneksi | Username | Status Langganan | Pembayaran Terakhir | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

Tombol/aksi: Open · Blokir · Checklist Semua · Unchecklist Semua

### `data-warga`

Judul: Data Seluruh Pelanggan

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Titik Kordinat | Tlp | Email | No ID Identitas | Nama Langganan | Keterangan | Harga | Kode Unik | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Nama Onu | Tanggal Registrasi | Tanggal Jatuh Tempo | Nama Sales | Aksi

Tabel 2: Total

Form 1 [post (self)]: filter:select*{5} = Pilih Filter / Lokasi / Router / Paket / Tanggal Jatuh Tempo<br>id_lokasi:select{6} = Pilih Lokasi / Semua Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK<br>id_router:select{5} = Pilih Router / Semua Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_tipe_pembayaran:select{15}<br>jatuh_tempo:select{33}

Tombol/aksi: Pilih · Nonaktifkan Data · Bayar Sekarang · Checklist Semua · Unchecklist Semua · Atur Kolom · Ringkas · Semua · Reset

### `data-warga-baru`

Judul: Data Pelanggan Baru Bulan October 2026

Tabel 1 (4 baris): Aksi | ID Pelanggan | Nama Warga | Alamat | Tlp | No ID Identitas | Foto ID | Nama Langganan | Keterangan | Harga | Catatan | Jenis Tipe Pembayaran | Level | Tanggal Registrasi | Nama Sales | Lokasi | Status | Aksisadsa

### `data-warga-kurang-bayar`

Judul: Data Pelanggan Yang Kurang Bayar October 2026

Tabel 1: Aksi | No | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Nominal Pembayaran | Status Pembayaran | Pembayaran Terakhir | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

Tabel 2: Total

Form 1 [post (self)]: tgl_jatuh_tempo:select*{6} = Pilih Jatuh Tempo / 07 / 10 / 18 / 21 / 28

### `detail-user`

Judul: Informasi Level User

Tabel 1 (10 baris): Nama Level | Menu | Akses

### `import-excel`

Judul: Tambah Data

Form 1 [post (self)]: account:number*<br>filexls:file


## Paket, Diskon & Deposit

### `add-deposit-pelanggan`

Judul: Pilih Pelanggan Yang Akan Deposit

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | No ID Identitas | Nama Langganan | Keterangan | Harga | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

### `add-diskon`

Judul: Pilih Pelanggan Yang Akan DIberikan Diskon

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | No ID Identitas | Nama Langganan | Keterangan | Harga | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

### `add-diskon-lokasi`

Judul: Tambah Data Diskon Semua Pelanggan

Form 1 [post (self)]: metode_insentif:select{3} = Pilih / Presentase / Nominal<br>id_lokasi:select*{4} = MURANET / AKR BATU / WOODVILLE / GREENPARK<br>nama_diskon:text<br>insentif_sales:number

### `add-diskon-paket`

Judul: Tambah Data Diskon Paket Semua Pelanggan

Form 1 [post (self)]: id_tipe_pembayaran:select*{13}<br>metode_insentif:select{3} = Pilih / Presentase / Nominal<br>nama_diskon:text<br>insentif_sales:number

### `add-diskon-paket-lokasi`

Judul: Tambah Data Diskon Paket & Lokasi Semua Pelanggan

Form 1 [post (self)]: id_tipe_pembayaran:select*{13}<br>metode_insentif:select{3} = Pilih / Presentase / Nominal<br>id_lokasi:select*{4} = MURANET / AKR BATU / WOODVILLE / GREENPARK<br>nama_diskon:text<br>insentif_sales:number

### `add-diskon-semua`

Judul: Tambah Data Diskon Semua Pelanggan

Form 1 [post (self)]: metode_insentif:select{3} = Pilih / Presentase / Nominal<br>nama_diskon:text<br>insentif_sales:number

### `add-tipe-pembayaran`

Judul: Tambah Data

Form 1 [post (self)]: jns_tipe_pembayaran:select*{3} = Pilih / Wajib Tiap Bulan / Tidak Wajib Tiap Bulan<br>id_lokasi:select{7}<br>buat_profile:select{3} = Pilih / Ya / Tidak<br>jns_koneksi:select{3} = Pilih / PPPOE / Hotspot<br>id_router:select{5} = Pilih Router / Semua Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>status_koneksi:select{0}<br>buat_pool:select{3} = Buat Pool Baru / Ya / Tidak<br>remote_address1:select{1} = Pilih Pool<br>filter_lokasi:select*{3} = Pilih / Ya / Tidak<br>nama_tipe:text*<br>keterangan:text*<br>harga:number*<br>nama_pool:text<br>local_address:text<br>remote_address:text<br>profile:text

### `data-deposit`

Judul: Data Deposit

Tabel 1: No | ID Reseller | Nama Reseller | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Waktu Entry | Keterangan | Cetak | Aksi

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-deposit-pelanggan`

Judul: Data Deposit

Tabel 1: No | ID Pelanggan | Nama Pelanggan | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Waktu Entry | Keterangan | Cetak | Aksi

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-diskon`

Judul: Data Diskon

Tabel 1 (2 baris): No | ID Pelanggan | Nama Pelanggan | Alamat | Nama Lokasi | Nama Langganan | Harga Paket | Keterangan | Nama Diskon | Metode Diskon | Nominal Diskon | Harga Setelah Diskon | Aksi

Tombol/aksi: Hapus Data Terpilih

### `data-rekening-payment-gateway`

### `data-tipe-bandwith`

### `data-tipe-ipl`

### `data-tipe-pembayaran`

Judul: Data Tipe Pembayaran

Tabel 1 (13 baris): No | Nama Tipe | Ketarangan Tipe | Harga | Jenis Pembayaran | Profile | Tampil Halaman Registrasi | Lokasi | Filter Lokasi | Jumlah Pelanggan | Aksi

### `edit-diskon`

Judul: Ubah Data

Form 1 [post (self)]: metode_insentif:select{3} = Nominal / Presentase / Nominal<br>id_lokasi:text<br>nama_warga:text*<br>nama_diskon:text<br>insentif_sales:number

### `edit-tipe-pembayaran`

Judul: Ubah Data

Form 1 [post (self)]: jns_tipe_pembayaran:select*{3} = Wajib Tiap Bulan / Wajib Tiap Bulan / Tidak Wajib Tiap Bulan<br>id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya 083142830676 / Pilih Lokasi / MURANET GRAHA<br>registrasi:select*{3} = Ya / Ya / Tidak<br>ubah1:select{2} = Ya / Tidak<br>ubahppn:select{3} = Ubah PPN / Ubah Tidak PPN / Tidak<br>filter_lokasi:select*{3} = Ya / Ya / Tidak<br>nama_tipe:text*<br>keterangan_tipe:text*<br>harga:number*<br>profile:text


## Tagihan & Pembayaran

### `add-akun`

Judul: Tambah Data

Form 1 [post (self)]: metode_pembuatan_kategori:select{3} = Pilih Metode Pembuatan / Buat Baru / Ambil Data<br>ambil_kategori:select{1} = Pilih Data<br>sub_akun:select{1} = Pilih Data<br>kode_akun:text*<br>nama_akun:text*<br>manual_kategori:text*<br>keterangan:textarea

### `add-ipl-non`

Judul: Tambah Data

Tabel 1 (2 baris): Nama Pembayaran | Harga | Jumlah | Total

Form 1 [post (self)]: id_tipe_pembayaran:select*{2} = Pilih Pembayaran / PAKET 25Mb BATU FREE - FREE - 0<br>id_warga:text<br>foto_bukti_pembayaran:file<br>jml_barang:number*

### `add-pemasukan`

Judul: Tambah Data

Form 1 [post (self)]: id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 / Pilih Lokasi / MURANET GRAHA<br>id_rekening:select*{3} = Pilih Metode Pemasukan / Cash / Tunai / Transfer Dari Rekening bca - PT. ANDIKA KOMUNIKA TAMA - 0888<br>nama_warga:text<br>alamat:text<br>tlp:number<br>jns_pemasukan:text<br>keterangan:text<br>nominal pemasukan:number*<br>waktu_pemasukan:datetime-local<br>foto_pengeluaran:file

### `add-pengeluaran`

Judul: Tambah Data

Form 1 [post (self)]: id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 / Pilih Lokasi / MURANET GRAHA<br>tipe_pengeluaran:select{3} = Pilih / Wajib Tiap Bulan / Tidak Wajib Tiap Bulan<br>id_rekening:select*{3} = Pilih Metode Pengeluaran / Cash / Tunai / Transfer Dari Rekening bca - PT. ANDIKA KOMUNIKA TAMA - 08<br>jns_pengeluaran:text<br>keterangan:text<br>jml_pengeluaran:number*<br>waktu_pengeluaran:datetime-local*<br>foto_pengeluaran:file

### `add-po`

Judul: Tambah Data PO / Penawaran

Form 1 [post (self)]: jenis_po:select*{3} = Pilih / PO / PENAWARAN HARGA<br>ppn:select*{3} = Pilih / Ya / Tidak<br>nama_warga:text*<br>wa:number*<br>nama_perusahaan:text*<br>alamat:text*<br>tlp:number*<br>email:email*<br>nama_tipe:text*<br>keterangan:text*<br>satuan:text*<br>jml:text*<br>harga:number*<br>diskon:number<br>tambahan_diskon:number<br>tgl_po:date

### `add-rekening`

Judul: Tambah Data

Form 1 [post (self)]: invoice:select*{3} = Pilih / Ya / Tidak<br>invoice_corporate:select*{3} = Pilih / Ya / Tidak<br>nama_rekening:text*<br>atas_nama:text*<br>no_rekening:text*

### `add-setor`

Judul: Tambah Data

Form 1 [post (self)]: id_rekening:select*{3} = Pilih Metode Pembayaran / Cash / Tunai / Transfer bca - PT. ANDIKA KOMUNIKA TAMA - 0888765088<br>diskon:select{3} = Pilih Metode Diskon / Presentase % / Nominal<br>id_warga:text<br>nama_tipe:text*<br>foto_bukti_pembayaran:file<br>bulan:text*<br>nominal_diskon:number<br>jumlah_bayar:number<br>keterangan:text

### `add-tagihan`

Judul: Tambah Data Tagihan

Form 1 [post (self)]: jns_diskon:select{3} = Pilih Metode Diskon / Presentase % / Nominal<br>tgl_jatuh_tempo:select{32}<br>nama_warga:text*<br>alamat:text*<br>tlp:text*<br>nama_tagihan:text*<br>nominal_tagihan:number*<br>keterangan:text<br>nama_diskon:text<br>nominal_diskon:number<br>bulan:text*

### `data-akun`

Judul: Daftar Akun

Tabel 1: No | Kode Akun | Nama Akun | Kategori | Pajak | Saldo | Aksi

### `data-ipl`

Judul: Data Pembayaran October 2026

Tabel 1: Aksi | No | Cetak | ID Pelanggan | Nama Pelanggan | Alamat | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Nama Sales | Waktu Entry | Keterangan | Aksi

Tabel 2: Pemasukan Langganan Cash | Pemasukan Langganan Transfer | Pemasukan Non Langganan Cash | Pemasukan Non Langganan Transfer | Total Pengeluaran Cash | Total Pengeluaran Transfer | Balance Cash | Balance Transfer / Non Cash | Total Pemasukan Langganan | Total Pemasukan Non Langganan | Total Pemasukan | Total Pengeluaran | Total Balance

Tabel 3: Total Pemasukan Langganan | Total Pemasukan Non Langganan | Total Pemasukan | Total Pengeluaran | Balance

Form 1 [post (self)]: id_lokasi:select{6} = Pilih Lokasi / Semua Lokasi / AKR BATU / GREENPARK / MURANET / WOODVILLE<br>bulan:text*

### `data-ipl-non`

Judul: Data Pembayaran

Tabel 1: Tanggal Entry | ID Pembayaran | Nama Warga | Jumlah Pembayaran | Total Pembayaran | Bukti Pembayaran | Nama Sales | Aksi

Tabel 2: Total Pemasukan Langganan | Total Pemasukan Non Langganan 5 | Total Pemasukan | Total Pengeluaran | Balance

### `data-laporan-ringkasan-transaksi`

Judul: Laporan Total Transaksi Periode Tahun 2026

Form 1 [get (self)]: tahun:select{7}

Tombol/aksi: Tampilkan · Print

### `data-laporan-ringkasan-transaksi-metode`

Judul: Laporan Total Transaksi Periode Tahun 2026

Form 1 [get (self)]: tahun:select{7}

Tombol/aksi: Tampilkan · Print

### `data-mutasi`

Judul: Data Mutasi October 2026

Tabel 1 (31 baris): No | Tanggal | Keterangan Kredit | Jumlah Kredit | Total Kredit | Keterangan Debit | Jumlah Debit | Total Debit | Saldo

Tabel 2: Total Kredit | Total Debit | Saldo

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-pemasukan-hari-ini`

Judul: Data Pemasukan Bulan October - 2026

Tabel 1: No | ID Pelanggan | Nama Pelanggan | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | Lokasi | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Nama Petugas | Waktu Entry | Keterangan | Metode Insentif | Insentif | Nominal Insentif | Cetak | Aksi

Tabel 2: Total Pemasukan PT.ANDIKA KOMUNIKA TAMA | Total Pemasukan | Total Insentif

Tabel 3: Pemasukan Langganan Cash | Pemasukan Langganan Transfer | Pemasukan Non Langganan Cash | Pemasukan Non Langganan Transfer | Total Pengeluaran Cash | Total Pengeluaran Transfer | Balance Cash | Balance Transfer / Non Cash | Total Pemasukan Langganan | Total Pemasukan Non Langganan | Total Pemasukan | Total Pengeluaran | Total Balance

Form 1 [post (self)]: filter:select{4} = Pilih Filter / Lokasi / Sales / Petugas Input<br>id_lokasi:select{5} = Pilih Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK<br>id_sales:select{7}<br>id_petugas:select{7}<br>tgl1:date*<br>tgl2:date*

### `data-pemasukan-lain`

Judul: Data Pemasukan Lain-Lain

Tabel 1: No | Jenis Pemasukan | Terima Dari | Nominal Pemasukan | Bukti Pemasukan | Keterangan | Nama Petugas | Waktu Entry | Cetak Bukti | Aksi

Tabel 2: Total Pemasukan Langganan | Total Pemasukan Non Langganan | Total Pemasukan | Total Pengeluaran | Balance

Form 1 [post (self)]: bulan:text*

### `data-pemasukan-ppob-hari-ini`

Judul: Data Transaksi PPOB Bulan October - 2026

Tabel 1: No | ID Pelanggan | Nama Pelanggan | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Waktu Entry | Keterangan | Cetak | Aksi

Tabel 2: Total Pemasukan | Total Pemasukan

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-pemasukan-validasi`

Judul: Data Pemasukan Bulan Cash October - 2026

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Nama Sales | Nama Pembayaran | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Alamat | Tlp | STO | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Waktu Entry | Keterangan | Status Setor | Aksi

Form 1 [post (self)]: id_lokasi:select*{5} = Pilih Lokasi / MURANET / AKR BATU / WOODVILLE / GREENPARK<br>status_setor:select*{3} = Pilih Status Setor / Belum / Sudah Setor<br>tgl1:date*<br>tgl2:date*

### `data-pemasukan-voucher`

Judul: Data Pemasukan Penjualan Voucher Bulan October - 2026

Tabel 1: Aksi | No | Cetak | Nama Voucher | Harga Jual | Harga Beli | Nama Reseller | Keuntungan Reseller | Tlp Pelanggan | Username | Password | Waktu Entry | Waktu Jual | Waktu Hapus | Status Hapus | Up Time | Bytes In | Packets In | Bytes Out | Packets Out | Status | Aksi

Tabel 2: Total Pemasukan Harga Penjualan Voucher | Total Pemasukan Harga Beli | Total Keuntungan | Total Voucher Belum Terjual

Form 1 [post (self)]: id_reseller:select{1} = Pilih Nama Reseller<br>id_lokasi:select{5} = Semua Lokasi / MURANET - GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya - 083142830 / AKR BATU - J<br>tgl1:date*<br>tgl2:date*

Tombol/aksi: Export Excel · Checklist Semua · Unchecklist · Hapus Terpilih (0)

### `data-pengeluaran`

Judul: Data Pengeluaran October 2026

Tabel 1: No | Jenis Pengeluaran | Waktu Pengeluaran | Nominal Pengeluaran | Metode Pengeluaran | Bukti Pengeluaran | Keterangan | Nama Sales | Aksi

Tabel 2: Total Pemasukan Langganan | Total Pemasukan Non Langganan | Total Pemasukan | Total Pengeluaran | Balance

Form 1 [post (self)]: bulan:select*{1} = Pilih Bulan<br>tahun:select*{1} = Pilih Tahun

### `data-pengeluaran-wajib-tiap-bulan`

Judul: Data Pengeluaran Master Wajib Tiap Bulan

Tabel 1: No | Jenis Pengeluaran | Waktu Pengeluaran | Nominal Pengeluaran | Metode Pengeluaran | Bukti Pengeluaran | Keterangan | Nama Sales | Aksi

Tabel 2: Total Pengeluaran | Noted

### `data-po`

Judul: Data PO dan Penawaran Harga

Tabel 1: No | ID | Jenis | Nama Pelanggan | Nama Perusahaan | Alamat | Tlp | Tanggal | Aksi

### `data-rekening`

Judul: Data Rekening

Tabel 1 (1 baris): No | Nama Rekening | Atas Nama | No Rekening | Tampil Di Invoice Broadband | Tampil Di Invoice Corporate | Aksi

### `data-setor`

Judul: Data Setor Bulan October - 2026

Tabel 1: No | Aksi | Cetak | ID Pelanggan | Nama Sales | Alamat | Nominal Harus Dibayar | Nominal Pembayaran | Status Pembayaran | Bukti Pembayaran | Periode Pembayaran | Metode Pembayaran | Nama Sales | Waktu Entry | Keterangan | Aksi

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-setor-voucher-admin`

Judul: Data Setor Voucher

Tabel 1: No | Nominal Setor | Waktu Setor | Nama Penyetor | Nama Penerima | Keterangan | Aksi

### `data-tagihan`

Judul: Data Tagihan Manual

Tabel 1: No | ID Tagihan | Nama | Alamat | Tlp | Nama Tagihan | Keterangan | Nominal Tagihan | Nama Diskon | Jenis Diskon | Nominal / Presentase Diskon | Total Tagihan | Tanggal Jatuh Tempo | Periode | Status | Waktu Entry | Aksi

### `edit-rekening`

Judul: Ubah Data

Form 1 [post (self)]: invoice:select*{3} = Ya / Ya / Tidak<br>invoice_corporate:select*{3} = Ya / Ya / Tidak<br>id_rekening:text<br>nama_rekening:text<br>atas_nama:text<br>no_rekening:text

### `faktur`

Judul: Tutorial Menu Faktur


## Jaringan & Aset

### `add-antena`

Judul: Tambah Data

Form 1 [post (self)]: mac:text*<br>ip:text*<br>ssid:text*<br>password:text*<br>freq:text*<br>channel:text*<br>lokasi:textarea*<br>keterangan:textarea*

### `add-genieacs-server`

Judul: Tambah Data

Form 1 [post (self)]: nama_genieacs:text*<br>ip_address:text*

### `add-odp`

Judul: Tambah Data

Form 1 [post (self)]: jns_perangkat:select*{8}<br>id_odc:select{1} = -- Pilih Koneksi ODC --<br>id_olt:select{1} = -- Pilih Koneksi OLT --<br>id_tiang:select{1} = -- Pilih Tiang --<br>pilih_port:text<br>warna_kabel:text<br>port1:text<br>keterangan1:text<br>port2:text<br>keterangan2:text<br>nama_odp:text*<br>model_odp:text*<br>sn_odp:text*<br>titik_lokasi:text<br>foto_lokasi:file<br>max_pelanggan:number<br>lokasi_odp:textarea*<br>keterangan:textarea*

Tombol/aksi: Find Location · View In Map

### `add-olt-new`

Judul: Tambah Data OLT

Form 1 [post (self)]: id_lokasi:select*{5} = Pilih Lokasi / AKR BATU / GREENPARK / MURANET / WOODVILLE<br>vendor:select*{5} = ZTE / HUAWEI / HSGQ / HIOSO / C-DATA<br>model:select*{0}<br>snmp_version:select{2} = 2c / 1<br>nama_olt:text*<br>host:text*<br>port_telnet:number*<br>username_telnet:text*<br>password_telnet:password*<br>port_snmp:number<br>snmp_community:text

Tombol/aksi: Simpan

### `add-router`

Judul: Tambah Data

Form 1 [post (self)]: id_lokasi:select*{5} = Pilih Lokasi / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya 083142830676 / AKR BATU JL. <br>nama_router:text*<br>ip_address:text*<br>username:text*<br>password:password*

### `add-tiang`

Judul: Tambah Data

Form 1 [post (self)]: kode_tiang:text<br>nama_tiang:text<br>titik_lokasi:text<br>foto_tiang:file<br>lokasi_tiang:textarea

Tombol/aksi: Find Location · View In Map · &times; · Selesai

### `add-tunnel`

Judul: Tambah Data

Form 1 [post (self)]: nama_tunnel:text*

### `data-antena`

Judul: Data Antena

Tabel 1: Aksi | No | MAC | IP Address | SSID | Password | Freq | Channel | Lokasi | Keterangan | Aksi

### `data-genieacs-server`

Judul: Data Genieacs

Tabel 1: No | Nama genieacs | Ip Address | Aksi

### `data-import-tiang`

Judul: Import Data Tiang

Form 1 [post (self)]: account:number*<br>filexls:file

### `data-odp`

Judul: Data ODP ODC OLT

Tabel 1: Aksi | No | ID | Jenis Perangkat | Nama | Merek / Model | SN | Lokasi | Maximal Jml Pelanggan | Jml Pelanggan Saat Ini | Kapasitas Yang Tersisa Saat Ini | Keterangan | Tersambung Ke OLT | Tersambung Ke ODC | Tersambung ke Port ODC Berapa? | Keterangan Port / Warna Kabel | Port Koneksi 1 | Keterangan Koneksi 1 | Port Koneksi 2 | Keterangan Koneksi 2 | Foto | Aksi

### `data-perangkat`

Judul: Data Inventaris Perangkat

Tabel 1: No | Aksi | ID | Jenis Inventaris | Jenis Perangkat | Nama Perangkat | Satuan | Harga Perangkat Per Unit | Stock Awal | Merek / Model | SN | Catatan | MAC Address | Keterangan Perangkat | Status Perangkat | Nama Pengguna Perangkat | Tanggal Terima Perangkat | Nama Penerima | Foto Tanda Tenerima | Data Diperbarui Oleh | Waktu Pembaruan | Aksi

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

Form 2 [post (self)]: jns_perangkat:select*{2} = Pilih / Semua Jenis

Tombol/aksi: Hapus Perangkat · Checklist Semua · Unchecklist Semua

### `data-perangkat-gudang`

Judul: Data Inventaris Perangkat Gudang

Tabel 1: No | Aksi | ID Masuk | ID | Jenis Inventaris | Jenis Perangkat | Nama Perangkat | Stock Awal | Merek / Model | SN | MAC Address | Keterangan Perangkat | Status Perangkat | Nama Pengguna Perangkat | Tanggal Terima Perangkat | Nama Penerima | Foto Tanda Tenerima | Data Diperbarui Oleh | Waktu Pembaruan | Aksi

### `data-perangkat-keluar`

Judul: Data Pengeluaran Perangkat Bulan October 2026

Tabel 1: No | Jenis Laporan | No Ticket | ID Perangkat | Jenis Perangkat | Satuan | Nama Perangkat | Model | SN | Jumlah | Keperluan | Foto Awal | Foto Akhir | Foto Pengeluaran | Nama Pengguna | Waktu Pengeluaran | Di Input Oleh | Penerima

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

### `data-perangkat-kembali`

Judul: Data Pengembalian Perangkat Bulan October 2026

Tabel 1: No | Jenis Laporan | No Ticket | ID Perangkat | Nama Perangkat | Model | SN | Jumlah | Keperluan | Waktu Pengeluaran | Di Input Oleh | Nama Yang Mengembalikan

### `data-perangkat-terpasang`

Judul: Data Inventaris Perangkat Terpasang

Tabel 1: No | Aksi | ID | Jenis Inventaris | Jenis Perangkat | Nama Perangkat | Stock Awal | Merek / Model | SN | MAC Address | Keterangan Perangkat | Status Perangkat | Nama Pengguna Perangkat | Tanggal Terima Perangkat | Nama Penerima | Foto Tanda Tenerima | Data Diperbarui Oleh | Waktu Pembaruan | Aksi

Tombol/aksi: Hapus Perangkat Keluar · Checklist Semua · Unchecklist Semua

### `data-router`

Judul: Data Router

Tabel 1 (3 baris): No | Nama Router | Ip Address | Lokasi | Jumlah Pelanggan | Cek Koneksi | Aksi

### `data-server-speedtest`

Judul: Server SpeedTest

Tabel 1: No | Nama Server | Lokasi | Priority | Aktif | Default | Health | Terakhir Cek | Aksi

Tabel 2: Server | Latency | Download | Upload | Health

Form 1 [get (self)]: health_status:select{4} = unknown / ok / degraded / down<br>name:text*<br>city:text<br>region:text<br>country_code:text<br>priority:number<br>download_url:url*<br>upload_url:url<br>latency_url:url<br>download_bytes:number<br>upload_bytes:number<br>latency_probe_bytes:number<br>latency_samples:number<br>supports_download:checkbox<br>supports_upload:checkbox<br>is_active:checkbox<br>is_default:checkbox<br>notes:textarea

Tombol/aksi: Test Semua Server · Tambah Server · &times; · Batal · Simpan · Update · Tutup

### `data-stock-perangkat`

Judul: Data Stock Inventaris

Tabel 1: No | Jenis Perangkat | Satuan | Nominal Rupiah | Total Perangkat | Total Pengeluaran | Total Pengembalian | Sisa Stock

### `data-tiang`

Judul: Data Tiang

Tabel 1: Aksi | No | Nama Tiang | Titik Koordinat | Nama Lokasi | Foto

### `data-tunnel`

Judul: Data Tunnel

Tabel 1 (3 baris): No | Nama Tunnel | User | Aksi

### `edit-olt-new`

Judul: Ubah Data OLT

Form 1 [post (self)]: id_lokasi:select*{5} = Pilih Lokasi / AKR BATU / GREENPARK / MURANET / WOODVILLE<br>nama_olt:text*<br>host:text*<br>port_telnet:number*<br>username_telnet:text*<br>password_telnet:password*<br>port_snmp:number*<br>snmp_community:password*

Tombol/aksi: Test Koneksi · Simpan

### `edit-router`

Judul: Ubah Data

Form 1 [post (self)]: id_lokasi:select*{6} = GREENPARK Jl. Telagah Indah, Ganting, Kabupaten Sidoarjo 6282141311479 / Pilih Lokasi / MURANET GRAH<br>ubah1:select{2} = Ya / Tidak<br>id_router:text<br>nama_router:text*<br>ip_address:text*<br>username:text*<br>password:password*

### `edit-tunnel`

Judul: Edit Data

Form 1 [post (self)]: nama_tunnel:text*


## Ticket & Laporan Pelanggan

### `add-laporan-bhp-uso-fee-isp`

Judul: Pilih Laporan

Form 1 [post (self)]: tgl_awal:date*<br>tgl_akhir:date*

### `add-laporan-daftar-lokasi`

Judul: Pilih Laporan

### `add-laporan-faktur`

Judul: Pilih Laporan e-Faktur

Form 1 [post (self)]: jns:select*{3} = Pilih / Lihat Data / Lapor Pajak<br>lihat:select{4} = Pilih Data / Sudah Lapor / Belum Lapor / Semua Data<br>jns_paket:select*{7}<br>id_tipe_pembayaran:select{13}<br>id_rekening:select{3} = Pilih Metode Pembayaran / Cash / Tunai / Transfer bca - PT. ANDIKA KOMUNIKA TAMA - 0888765088<br>tgl1:date*<br>tgl2:date*<br>id_warga:text<br>transaksi:number<br>faktur:number

### `add-laporan-general-`

Judul: Form Entry Data Ticket

Form 1 [post (self)]: id_warga:select*{3} = Pilih / General / Project<br>jns_laporan:select*{19}<br>id_lokasi:select*{5} = Pilih / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 / AKR BATU JL. ABDUL G<br>nama_laporan:text*<br>waktu_masuk:datetime-local<br>waktu_keluar:datetime-local<br>foto_ktp:file<br>keterangan:textarea*

### `add-laporan-ipl`

Judul: Pilih Laporan

Form 1 [post (self)]: tahun:select*{2} = 2026 / Pilih Tahun<br>jns_tipe_pembayaran:select*{3} = Pilih / Wajib Tiap Bulan (Langganan) / Tidak Wajib Tiap Bulan (Non Langganan)

### `add-laporan-labarugi`

Judul: Pilih Laporan

### `add-laporan-pelanggan-baru`

Judul: Laporan Pelanggan Baru

Form 1 [post (self)]: tgl_awal:date*<br>tgl_akhir:date*

### `add-laporan-pengeluaran`

Judul: Pilih Laporan

### `add-laporan-pengeluaran-bulan`

Judul: Pilih Laporan

Form 1 [post (self)]: tgl_awal:date*<br>tgl_akhir:date*

### `add-laporan-ringkasan`

Judul: Pilih Laporan

### `add-laporan-sales`

Judul: Pilih Laporan

### `add-laporan-sales-bulan`

Judul: Pilih Laporan

Form 1 [post (self)]: tgl_awal:date*<br>tgl_akhir:date*

### `add-laporan-ticket`

Judul: Pilih Laporan Ticket

Form 1 [post (self)]: tgl_awal:date*<br>tgl_akhir:date*

### `add-laporan-ticket-jenis-status`

Judul: Pilih Laporan Ticket Berdasarkan Jenis dan Status

Form 1 [get index.php]: jns_laporan:select*{22}<br>status:select*{12}<br>tgl_awal:date*<br>tgl_akhir:date*

Tombol/aksi: Lihat Data

### `add-laporan-ticket-kategori`

Judul: Pilih Laporan Ticket Berdasarkan Jenis

Form 1 [post (self)]: jns_laporan:select*{22}<br>tgl_awal:date*<br>tgl_akhir:date*

### `data-laporan-general-aktivasi`

Judul: Data Laporan General Status Open

Tabel 1: Aksi | No | Tipe Laporan | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

### `data-laporan-general-closed`

Judul: Data Laporan General Closed

Tabel 1: No | Tipe Laporan | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

### `data-laporan-general-dalam-penanganan`

Judul: Data Laporan General Status Dalam Penanganan

Tabel 1: Aksi | No | Tipe Laporan | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

### `data-laporan-general-open`

Judul: Data Laporan General Status Open

Tabel 1: Aksi | No | Tipe Laporan | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

### `data-laporan-general-pending`

Judul: Data Laporan General Status Pending

Tabel 1: No | Tipe Laporan | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

### `data-laporan-pelanggan-`

Judul: Data Ticket Pelanggan

Tabel 1: No | Aksi | ID Pelanggan | Nama Pelanggan | Alamat | Titik Kordinat | Tlp | Email | No ID Identitas | Nama Langganan | Keterangan | Harga | Kode Unik | Pembayaran Terakhir | Nama Lokasi | Nama Router | Jenis Koneksi | Status Langganan | Username | Password | Nama Onu | Tanggal Registrasi | Tanggal Jatuh Tempo | Aksi

### `data-laporan-pelanggan-aktivasi`

Judul: Data Laporan Pelanggan Status Permintaan Aktivasi

Tabel 1: Aksi | No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Lokasi | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

Form 1 [post (self)]: jns_laporan:select*{20}

Tombol/aksi: Export to Excel

### `data-laporan-pelanggan-berita-acara`

Judul: Data Berita Acara October 2026

Tabel 1 (7 baris): Aksi | No | ID Pelanggan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Nama Laporan | Jenis Laporan

Form 1 [post (self)]: bulan:select*{9}<br>tahun:select*{3} = Pilih Tahun / 2025 / 2026

### `data-laporan-pelanggan-closed`

Judul: Data Laporan Pelanggan Closed

Tabel 1: No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Lokasi | Nama Laporan | Jenis Laporan | Waktu Open | Waktu Close | Durasi Pengerjaan | Kendala / Root Cause | Aksi Perbaikan | Foto | Keterangan | Nama Teknisi | Status | Aksi

Tabel 2 (1 baris): Nama Teknisi | Total Ticket

Form 1 [get (self)]: jns_laporan:select{21}<br>tgl1:date*<br>tgl2:date*

Tombol/aksi: Tampilkan · Reset

### `data-laporan-pelanggan-dalam-penanganan`

Judul: Data Laporan Pelanggan Status Dalam Penanganan

Tabel 1 (1 baris): Aksi | No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Lokasi | Nama Laporan | Jenis Laporan | Nama Teknisi | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

Form 1 [post (self)]: jns_laporan:select*{20}

Tombol/aksi: Export to Excel

### `data-laporan-pelanggan-jadwal-pemasangan`

Judul: Data Laporan Pelanggan Status Jadwal Pemasangan

Tabel 1: Aksi | No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Nama Laporan | Jenis Laporan | Nama Teknisi | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

Form 1 [post (self)]: jns_laporan:select*{20}

### `data-laporan-pelanggan-open`

Judul: Data Laporan Pelanggan Status Open

Tabel 1 (55 baris): Aksi | No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Lokasi | Map Installasi Pelanggan | ODP ODC Terdekat | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

Form 1 [post (self)]: jns_laporan:select*{20}

Tombol/aksi: Export to Excel

### `data-laporan-pelanggan-pending`

Judul: Data Laporan Pelanggan Status Pending

Tabel 1 (1 baris): No | ID Pelanggan | ID Laporan | Nama Pelanggan | Tlp Pelanggan | Alamat Pelanggan | Titik Koordinat | Lokasi | Nama Laporan | Jenis Laporan | Waktu Masuk | Waktu Keluar | Foto | Keterangan | Status | Aksi

Form 1 [post (self)]: jns_laporan:select*{20}

Tombol/aksi: Export to Excel

### `edit-laporan-pelanggan-`

Judul: Form Update Data Laporan Pelanggan

Tabel 1 (1 baris): No | Keterangan | Foto | Diperbarui Oleh | Status | Aksi

Form 1 [post (self)]: status:select*{8}<br>id_teknisi5:select{6} = BHAGUS PRATAMA / Dami Teknisi - Teknisi / BHAGUS PRATAMA - Teknisi / NURUDDIN HIDAYATULLAH - Teknisi<br>id_teknisi6:select{6} = Pilih Teknisi 2 / Dami Teknisi - Teknisi / BHAGUS PRATAMA - Teknisi / NURUDDIN HIDAYATULLAH - Teknis<br>nominal12:number<br>foto_ktp:file<br>keterangan:textarea*

Form 2 [post (self)]: status:select*{8}<br>id_teknisi5:select{6} = PT.ANDIKA KOMUNIKA TAMA / Dami Teknisi - Teknisi / BHAGUS PRATAMA - Teknisi / NURUDDIN HIDAYATULLAH <br>id_teknisi6:select{6} = Pilih Teknisi 2 / Dami Teknisi - Teknisi / BHAGUS PRATAMA - Teknisi / NURUDDIN HIDAYATULLAH - Teknis<br>kendala:text<br>aksi_perbaikan:text<br>nominal12:number<br>foto_ktp:file<br>keterangan:textarea*


## SDM, Payroll & Absensi

### `add-absensi-karyawan`

Judul: Absensi Karyawan

Form 1 [post (self)]: titik_lokasi:text*

Tombol/aksi: Mulai Absensi · Ambil Foto · Ambil Ulang Lokasi · Simpan Absensi

### `add-absensi-karyawan-pulang`

Judul: Absensi Karyawan

Form 1 [post (self)]: titik_lokasi:text*

Tombol/aksi: Mulai Absensi · Ambil Foto · Ambil Ulang Lokasi · Simpan Absensi

### `add-cuti-karyawan`

Judul: Tambah Data Cuti / Izin

Form 1 [post (self)]: jenis_cuti:select*{3} = Pilih / Cuti / Izin<br>waktu_absen:date*<br>waktu_absen1:date*<br>keterangan:text*<br>foto_ktp:file

### `add-daily`

Judul: Tambah Data

Form 1 [post (self)]: nama_aktifitas:text*<br>titik_lokasi:text<br>tanggal_aktifitas:date*<br>foto_bukti_pembayaran:file<br>keterangan_aktifitas:textarea

### `add-pemotongan`

Judul: Tambah Data

Form 1 [post (self)]: id_karyawan:select*{1} = Pilih<br>jenis_pemotongan:select*{3} = Pilih / Wajib Tiap Bulan / Tidak Wajib Tiap Bulan<br>nama_tunjangan:text<br>nominal_tunjangan:number*<br>waktu_tunjangan:datetime-local*

### `add-piutang`

Judul: Tambah Data

Form 1 [post (self)]: id_karyawan:select*{1} = Pilih<br>id_rekening:select*{3} = Pilih Metode Pengeluaran Piutang / Cash / Tunai / Transfer Dari Rekening bca - PT. ANDIKA KOMUNIKA T<br>pemotongan_gaji:select*{3} = Pilih / Tidak / Ya<br>keterangan:text<br>nominal_hutang:number*<br>waktu_hutang:datetime-local*<br>waktu_pemotongan:datetime-local*

### `add-tunjangan`

Judul: Tambah Data

Form 1 [post (self)]: id_karyawan:select*{1} = Pilih<br>jns_tunjangan:select*{3} = Pilih / Wajib Tiap Bulan / Tidak Wajib Tiap Bulan<br>nama_tunjangan:text<br>nominal_tunjangan:number*<br>waktu_tunjangan:datetime-local*<br>foto_tunjangan:file

### `data-absensi-karyawan`

Judul: Data Absen Karyawan

Tabel 1: No | Karyawan | Alamat | Tlp | Tanggal | Shift | Masuk | Telat | Pulang | Durasi Kerja | Jenis | Foto Masuk | Foto Pulang | Maps Masuk | Maps Pulang | Max Jarak | Jarak | Aksi

Form 1 [post (self)]: id_warga:select*{2} = Pilih Karyawan / Semua Karyawan<br>awal:date*<br>akhir:date*

Tombol/aksi: Pilih

### `data-cuti-karyawan`

Judul: Data Izin / Cuti Karyawan

Tabel 1: No | Nama Karyawan | Jabatan | Alamat | Tlp | Jenis | Tanggal | Periode | Keterangan | Foto | Status | Aksi

Form 1 [post ?page=data-cuti-karyawan]: bulan:month*

Tombol/aksi: Tampilkan Data

### `data-daily`

Judul: Data Pekerjaan Harian

Tabel 1: No | Nama Petugas | Nama Aktifitas | Tgl Aktifitas | Keterangan Aktifitas | Foto Aktifitas | Waktu Entry | Aksi

Form 1 [post (self)]: bulan:select*{1} = Pilih Bulan<br>tahun:select*{1} = Pilih Tahun

### `data-gaji-karyawan`

Judul: Data Gaji Karyawan Periode October 2026 ( 01-January-1970 S/D 01-January-1970)

Tabel 1: No | Nama Karyawan | Jabatan | Infomasi Rekening | Alamat | Tlp | Hak Cuti 1 Tahun | Gaji Pokok | Tunjangan Transport Perhari | Tunjangan Makan Perhari | Total Hari Kerja | Total Hari Izin | Total Hari Cuti | Total Hari Absen | Tunjangan Transport Makan | Tunjangan Lembur | Tunjangan Lain-Lain | Gaji Kotor | Pemotongan Gaji | Gaji | Aksi

Tabel 2: Total Pengeluaran Gaji Bulan Ini | Total Pengeluaran Piutang Karyawan Bulan Ini | Total Pengembalian Piutang Karyawan Bulan Ini | Total Pengeluaran Gaji dan Piutang Karyawan

Form 1 [post (self)]: bulan:text*

Tombol/aksi: Tambah Pengeluaran Semua

### `data-lembur-karyawan`

Judul: Data Lemburan Karyawan Bulan October 2026

Tabel 1: No | Nama Karyawan | Jabatan | Nominal Lembur Perjam | Alamat | Tlp | Tanggal | Keterangan Lembur | Waktu Masuk | Waktu Pulang | Durasi Bekerja | Total Pendapatan Lembur | Status | Aksi

Form 1 [post (self)]: tgl1:date*<br>tgl2:date*

Tombol/aksi: Checklist Semua · Unchecklist Semua · Setujui Terpilih

### `data-lupa-absen`

Judul: Data Lupa Absen Bulan October 2026

Tabel 1: No | Nama Karyawan | Jenis Absen | Waktu Absen | Shift | Status | Aksi

### `data-master-absensi`

Judul: Data Master Absensi

Tabel 1: No | Nama Cabang | Alamat | ID | Shift | Multi Shift | Waktu Masuk | Waktu Pulang | Titik Koordinat Absensi Masuk | Titik Koordinat Absensi Pulang | Aksi

### `data-master-gaji-karyawan`

Judul: Data Master Gaji Karyawan

Tabel 1: No | Aksi | Nama Karyawan | Tanggal Lahir | Tanggal Bergabung | Tanggal Berakhir Masa Kerja | Jabatan | Informasi Rekening | Alamat | Tlp | Foto Karyawan | Nama Ibu | Tlp Ibu | Nama Ayah | Tlp Ayah | ID Shift | Nama Shift | Multi Shift | Waktu Masuk Shift | Waktu Pulang Shift | Gaji Pokok | Tunjangan Makan | Tunjangan Transport | Nominal Lembur Perjam | Hak Cuti | Sisa Cuti | Aksi

### `data-pemotongan`

Judul: Data Pemotongan Gaji Karyawan October 2026

Tabel 1: No | Nama Karyawan | Alamat | Tlp | Jabatan | Nama Pemotongan | Waktu Pemotongan | Nominal Pemotongan | Aksi

Form 1 [post (self)]: bulan:select*{1} = Pilih Bulan<br>tahun:select*{1} = Pilih Tahun

### `data-piutang-karyawan`

Judul: Data Piutang - Oktober 2026

Tabel 1: No | ID Piutang | Nama Karyawan | Alamat | Tlp | Jabatan | Waktu Piutang | Keterangan Piutang | Nominal Piutang | Total Pengembalian | Sisa Hutang | Aksi

Tabel 2: Ringkasan Piutang - Oktober 2026 | Total Piutang | Total Yang Sudah Dikembalikan | Total Yang Belum Dikembalikan

Form 1 [get (self)]: bulan:select*{12}<br>tahun:select*{13}

Tombol/aksi: Lihat Data

### `data-rekap-absensi-karyawan`

Judul: Data Rekap Absen Karyawan Bulan October 2026

Tabel 1: No | Nama Karyawan | Kamis, 01 Oktober 2026 | Jumat, 02 Oktober 2026 | Sabtu, 03 Oktober 2026 | Minggu, 04 Oktober 2026 | Senin, 05 Oktober 2026 | Selasa, 06 Oktober 2026 | Rabu, 07 Oktober 2026 | Kamis, 08 Oktober 2026 | Jumat, 09 Oktober 2026 | Sabtu, 10 Oktober 2026 | Minggu, 11 Oktober 2026 | Senin, 12 Oktober 2026 | Selasa, 13 Oktober 2026 | Rabu, 14 Oktober 2026 | Kamis, 15 Oktober 2026 | Jumat, 16 Oktober 2026 | Sabtu, 17 Oktober 2026 | Minggu, 18 Oktober 2026 | Senin, 19 Oktober 2026 | Selasa, 20 Oktober 2026 | Rabu, 21 Oktober 2026 | Kamis, 22 Oktober 2026 | Jumat, 23 Oktober 2026 | Sabtu, 24 Oktober 2026 | Minggu, 25 Oktober 2026 | Senin, 26 Oktober 2026 | Selasa, 27 Oktober 2026 | Rabu, 28 Oktober 2026 | Kamis, 29 Oktober 2026 | Jumat, 30 Oktober 2026 | Sabtu, 31 Oktober 2026 | Total Telat | Total Tidak Telat | Total Izin | Total Cuti | Total Alpha

Form 1 [post (self)]: awal:date*<br>akhir:date*

Tombol/aksi: Tampilkan Data

### `data-tunjangan`

Judul: Data Tunjangan October 2026

Tabel 1: No | Nama Karyawan | Alamat | Tlp | Jabatan | Nama Tunjangan | Waktu Tunjangan | Nominal Tunjangan | Keterangan | Foto Tunjangan | Aksi

Form 1 [post (self)]: bulan:select*{1} = Pilih Bulan<br>tahun:select*{1} = Pilih Tahun

### `edit-cut-off-penggajian`

Judul: Data Cut Off Penggajian Karyawan

Form 1 [post (self)]: tgl_mulai:select{31}<br>tgl_akhir:select{31}<br>bulan:select{2} = Bulan Yang Sama / Bulan Berikutnya<br>id_cut_off:text


## Voucher & Reseller

### `cek-voucher`

Judul: Cek Voucher

Form 1 [post (self)]: username:text*

### `data-generate-voucher-`

Judul: Data Seluruh User Reseller

Tabel 1: Aksi | Nama Reseller | Alamat | Tlp | NIK | Foto KTP | Level | Server Akses | Jumlah Stock Voucher | Aksi

### `data-harga-voucher`

Judul: Data Harga Voucher

Tabel 1: No | ID | Nama | Harga Jual | Harga Beli | Profile | Keterangan | Lokasi | Nama Router | Script On Login | Aksi

### `data-user-reseller`

Judul: Data Seluruh User Reseller

Tabel 1: Aksi | Nama User | Alamat | Tlp | NIK | Foto KTP | Level | Server Akses | Lokasi | Aksi


## Poin & Hadiah

### `add-pengaturan-poin`

Judul: Tambah Data

Form 1 [post (self)]: ketentuan_poin:select{53}<br>id_lokasi:select{6} = Pilih Lokasi / Pilih Lokasi / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 <br>nama_poin:text*<br>total_poin:number*<br>keterangan_poin:text*

### `data-pengajuan-penukaran-poin`

Judul: Data Pengajuan Penukaran Poin

Tabel 1: No | Nama Pelanggan | Alamat | Tlp | Total Poin Yang Ditukar | Nama Hadiah Yang Ditukar | Total Ketentuan Penukaran | Waktu Pengajuan Penukaran | Status Pengajuan | Status Pengambilan Hadiah | Foto Pengambilan Hadiah | Nama Penyerah Hadian | Waktu Penyerahan Hadiah | Aksi

### `data-pengaturan-poin`

Judul: Data Pengaturan Poin

Tabel 1: No | Nama Poin | Ketentuan Poin | Total Poin | Keterangan Poin | STO | Aksi

### `data-penukaran-hadiah-poin`

Judul: Data Penukaran Hadiah Poin · Anda Memiliki 0

Tabel 1: No | Foto | Nama Hadiah | Ketentuan Nominal Poin | Jumlah Stok | Keterangan | STO | Aksi


## Finance & Accounting

### `add-finance-accounting-contact`

Judul: Tambah Data Contact

Form 1 [post (self)]: tipe_contact:select{5} = Pilih / Vendor / Karyawan / Customer / Lainnya<br>tipe_identitas:select*{5} = Pilih / KTP / SIM / Passport / KITAS<br>nama_display:text*<br>nama_depan:text*<br>nama_tengah:text<br>nama_akhir:text*<br>nama_perusahaan:text*<br>info_tambahan:text<br>nomor_telepon_hp:number*<br>nomor_telepon:number*<br>fax:number<br>email:email*<br>nomor_identitas:number*<br>npwp:number*<br>nama_bank:text*<br>cabang_bank:text*<br>nama_pemilik_rekening:text*<br>nomor_rekening:text*<br>nama_bank_kedua:text<br>cabang_bank_kedua:text<br>nama_pemilik_rekening_kedua:text<br>nomor_rekening_kedua:text<br>nama_bank_ketiga:text<br>cabang_bank_ketiga:text<br>nama_pemilik_rekening_ketiga:text<br>nomor_rekening_ketiga:text<br>alamat_penagihan:textarea*<br>alamat_pengiriman:textarea*

### `add-finance-accounting-data-balance`

Judul: Tambah Data Balance

Form 1 [post (self)]: nama_balance:text*<br>nominal:number*<br>waktu_balance:datetime-local*<br>keterangan:textarea*

### `add-finance-accounting-payment-request`

Judul: Tambah Data Payment Request

### `add-finance-accounting-petty-cash`

Judul: Tambah Data Petty Cash

### `add-finance-accounting-rembursment`

Judul: Tambah Data Rembursment

### `finance-accounting-cash-bank`

### `finance-accounting-contact`

Judul: Data Contact

Tabel 1: No | Nama Display | Tipe Contact | Email | Nomor Telepon | Nomor Telepon HP | Perusahaan | Balance | Created | Aksi

### `finance-accounting-daftar-akun`

Judul: Data Manajemen Akun

Form 1 [post (self)]: bulan:text*

### `finance-accounting-dashboard`

Judul: 0 · Dashboard Finance & Accounting

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Metode Pembayaran | Keterangan | Lampiran | Status | Total | Status Pembayaran | Jenis

Form 1 [post ?page=finance-accounting-dashboard-]: bulan:text*

Tombol/aksi: Pilih

### `finance-accounting-data-balance`

Judul: Data Balance

Tabel 1: No | Nama Balance | Keterangan | Nominal | Waktu | Nama Petugas | Waktu Input | Aksi

### `finance-accounting-manage-kategori`

### `finance-accounting-paid`

Judul: 0 · 104 · Petty Cash Paid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-paid-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-paid-payment-request`

Judul: 0 · Payment Request Paid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-paid-payment-request-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-paid-rembursment`

Judul: 0 · Rembursment Paid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-paid-rembursment-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-payment-request`

Judul: 0 · Payment Request

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-payment-request-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-petty-cash`

Judul: 0 · 104 · Petty Cash

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Telah Digunakan | Sisa Nominal | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-petty-cash-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-rembursment`

Judul: 0 · 64 · Rembursment

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-rembursment-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-require-approval`

Judul: 0 · 104 · Petty Cash Require Approval

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-require-approval-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-require-approval-payment-request`

Judul: 0 · Payment Request Require Approval

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-require-approval-payment-request-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-require-approval-rembursment`

Judul: 0 · 64 · Rembursment Require Approval

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-require-approval-rembursment-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-tambah-akun`

Judul: Tambah Akun

Form 1 [post (self)]: kategori:select{9}<br>tipe_akun:select{3} = Pilih Tipe Akun / Balance Sheet / Profit & Loss<br>status:select{3} = Pilih Status / Open / Closed<br>balance_position:select{3} = Pilih Position / Debit / Kredit<br>nama_akun:text*<br>nomor_akun:text*<br>saldo_awal:number<br>detail:text<br>default_account_tax:text<br>deskripsi:textarea

### `finance-accounting-unpaid`

Judul: 0 · 104 · Petty Cash Unpaid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-unpaid-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-unpaid-payment-request`

Judul: 0 · Payment Request Unpaid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-unpaid-payment-request-]: bulan:text*

Tombol/aksi: Pilih · Close

### `finance-accounting-unpaid-rembursment`

Judul: 0 · Rembursment Unpaid

Tabel 1: Tanggal | Nomor | Nomor Akun | Pembayaran Dari | Penerima | Keterangan | Lampiran | Status | Total | Status Pembayaran | Aksi

Tabel 2: Tanggal

Form 1 [post ?page=finance-accounting-unpaid-rembursment-]: bulan:text*

Tombol/aksi: Pilih · Close


## WhatsApp, Telegram & Notifikasi

### `data-api-whatsapp-gateway`

Judul: Data Whatsapp Gateway

Tabel 1: No | Jenis Whatsapp Gateway | Status | Aksi

### `data-fail`

Judul: Data Whataspp Failed / Gagal

Tabel 1: No | Device | Message | Recipient | Date | Aksi

Form 1 [post (self)]: tgl1:date*

### `data-group`

Judul: Data Group ID

Tabel 1: No | ID Group | Nama Group

### `data-group-telegram`

Judul: Data Group ID Telegram

Tabel 1 (1 baris): No | ID Group | Nama Group | Status

### `data-in`

Judul: Data Whataspp In

Tabel 1: No | Message | Recipient | Date | Status | Aksi

### `data-notifikasi`

Judul: Data Notifikasi

Tabel 1 (15 baris): No | Nama Notifikasi | Tgl Mengingatkan | Wkt Mengingatkan | Tipe Mengingatkan | Pelanggan Yg Diingatkan | Tampilkan Link | Aksi

### `data-outbox`

Judul: Data Pesan Outbox

Tabel 1: No | Device | Message | Recipient | Date | Aksi

### `data-sent`

Judul: Data Whataspp Sent

Tabel 1: No | Device | Message | Recipient | Date | Aksi

### `data-virtual-assistant`

Judul: Contoh Penginputan AutoReply Virtual Asisten Custom

Tabel 1 (5 baris): Keyword | Reply | type

### `edit-mail-server`

Judul: Data Mail Server

Form 1 [post (self)]: enkripsi:select*{1} = TLS<br>status:select*{2} = Aktif / Tidak Aktif<br>id_mail_server:text<br>email_address:email*<br>pass:password<br>smtp:text*<br>port:number*

### `edit-notifikasi`

Judul: Ubah Data

Form 1 [post (self)]: link:select{3} = Ya / Ya / Tidak<br>nama_notifikasi:text<br>header:textarea<br>footer:textarea

Form 2 [post (self)]: tipe_notifikasi:select{3} = Otomatis / Otomatis / Manual<br>tipe_pelanggan:select{3} = Jatuh_Tempo / Semua Pelanggan / Pelanggan Sesuai Tgl Jatuh Tempo<br>tgl:select{43}<br>link:select{3} = Ya / Ya / Tidak<br>nama_notifikasi:text<br>waktu:time<br>tgl_notifikasi:date<br>header:textarea<br>footer:textarea

### `setting-push-notifikasi`

Judul: Setting Push Notifikasi

Form 1 [post (self)]: push_notif:radio<br>push_notif:radio

Tombol/aksi: &times; · Pelajari lebih lanjut · Tutup


## Kemitraan & Cabang

### `data-kemitraan`

Judul: Dashboard Kemitraan PT.ANDIKA KOMUNIKA TAMA Bulan October 2026

Tabel 1: Aksi | No | Nama ISP Pusat | Alamat ISP Pusat | No Account | Expired | Nama Mitra | Alamat | Jumlah Pelanggan | Pelanggan Lunas | Pelanggan Belum Lunas | Total Pelanggan PPN dan Nominal | Total Pelanggan Non PPN dan Nominal | Total Pemasukan PPN Bulan Ini | Total Pemasukan Non PPN Bulan Ini | Total Pemasukan Bulan Ini | Pengaturan BHP | BHP 1,25% (Pelanggan PPN,Setelah Dikurangi PPN) | Pengaturan USO | USO 0,5% (Pelanggan PPN,Setelah Dikurangi PPN) | Total Pemasukan Setelah PPN,BHP,USO | Pengaturan Fee Ke ISP | Total Fee ke ISP(Setelah dikurangi PPN dan BHP,USO) | Total Estimasi Pemasukan Bulan Ini | Aksi

Tabel 2: Total Seluruh Pelanggan Mitra | Total Pemasukan PPN | Total BHP | Total USO | Total Fee ISP Yang Didapat | Total Pemasukan Mitra Bulan ini | Total Estimasi Pemasukan Mitra Bulan ini

Tabel 3: No | Nama Dokumen | Link Dokumen | Waktu Upload | Diupload Oleh

Form 1 [post (self)]: bulan:text*


## Pengaturan Sistem

### `add-user`

Judul: Form Entry Data Users

Form 1 [post (self)]: id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 / Pilih Lokasi / MURANET GRAHA<br>level:select*{25}<br>jns_pembagian_fee:select{3} = -- Pilih -- / Pembagian Hasil / Penambahan Biaya Admin<br>metode_insentif:select{1} = Nominal<br>nama_warga:text*<br>tlp:number*<br>email:email<br>nik:number<br>foto_ktp:file<br>alamat:text*<br>dusun:text<br>nomor_rumah:text<br>blok:text<br>kelurahan:text<br>kecamatan:text<br>kabupaten:text<br>provinsi:text<br>insentif_sales:text

### `data-banner`

Judul: Kelola Banner

Tabel 1: No | Gambar | Nama Banner | Account | Aksi

Form 1 [get (self)]: nama_benner:text*<br>gambar:file*

Tombol/aksi: Tambah Banner · &times; · Batal · Simpan · Update · ' + ' ' + '

### `data-log`

Judul: Data Log

Tabel 1: ID | No | Nama Log | ID Pengguna | Nama Pengguna | Waktu

Form 1 [get (self)]: tgl1:date*<br>tgl2:date*

Tombol/aksi: Pilih

### `data-perusahaan`

Judul: Data Perusahaan

Tabel 1 (1 baris): Aksi | No | Nama Perusahaan | Supported By | Logo Perusahaan | Logo Support | Keterangan Usaha | Alamat | Tlp | Email | Nama Perwakilan | TTD Perwakilan | Jabatan | Pengaturan Tagihan | Periode Tagihan | ID Group WA Ticket | ID Group Telegram Ticket | ID Group WA Monitoring | ID Group Telegram Monitoring | QR Registrasi Mandiri | BHP | USO | Fee ISP | Aksi

### `data-setting`

Judul: Setting · Setting Payment Gateaway · Langkah Ke 3

Tombol/aksi: &times; · Tutup

### `data-update-apk`

Judul: Data Informasi Update APK

Tabel 1 (43 baris): No | Nama Update | Lokasi Menu | Waktu Update | Keterangan | Nama Petugas | Aksi

### `data-user`

Judul: Data Seluruh User

Tabel 1 (6 baris): Aksi | Nama User | Alamat | Tlp | NIK | Foto KTP | Level | Status | Aksi

### `edit-perusahaan`

Judul: Ubah Data

Form 1 [post (self)]: tagihan:select*{4} = Default / Default / Pasca Bayar / Prabayar dan Pascabayar<br>periode:select*{4} = Default / Default / Bulan Berjalan / Bulan Sebelumnya<br>bhp:select{2} = Semua Pelanggan / Pelanggan PPN Saja<br>uso:select{2} = Semua Pelanggan / Pelanggan PPN Saja<br>metode_fee:select{2} = Presentase / Nominal<br>id_lokasi:text<br>nama_lokasi:text<br>power_by:text<br>tlp_lokasi:number<br>email:text<br>nama_perwakilan:text<br>jabatan:text<br>group_wa:text<br>id_telegram_ticket:text<br>group_realtime_monitoring:text<br>id_telegram_monitoring:text<br>token_telegram:text<br>logo_usaha:file<br>logo_isp:file<br>ttd_perusahaan:file<br>nominal_bhp:text<br>nominal_uso:text<br>nominal_fee:text<br>ppn:number<br>keterangan_lokasi:textarea*<br>alamat_lokasi:textarea*

### `edit-user`

Judul: Ubah Data User

Form 1 [post (self)]: id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya 083142830676 / Pilih Lokasi / MURANET GRAHA<br>status:select*{3} = -- Pilih Status -- / Aktif / Tidak Aktif<br>level:select*{25}<br>jns_pembagian_fee:select{2} = Pembagian Hasil / Penambahan Biaya Admin<br>metode_insentif:select{1} = Nominal<br>nama_warga:text<br>tlp:number*<br>tlp2:number*<br>nik:number<br>foto_ktp:file<br>username:text<br>password:password<br>no_rumah:text<br>blok:text<br>dusun:text<br>kelurahan:text<br>kecamatan:text<br>kabupaten:text<br>propinsi:text<br>insentif_sales:text<br>alamat:textarea*

### `login-api`

Judul: Login

Form 1 [get (self)]: account:text*<br>username:text*<br>password:password*

Tombol/aksi: Log in · Salin


## Lain-lain / belum terklasifikasi

### `add-lokasi`

Judul: Tambah Data

Form 1 [post (self)]: metode_insentif:select{3} = Pilih / Presentase / Nominal<br>nama_lokasi:text*<br>tlp_lokasi:number<br>insentif_sales:text<br>group_wa:text<br>alamat_lokasi:textarea*

### `add-payment-gateway`

Judul: Tambah Data

Form 1 [post (self)]: metode:select*{3} = Pilih / Join e-Billing / Private<br>jns:select*{6} = Pilih / XENDIT / MOOTA / TRIPAY / DUITKU / PAKARDIGITAL<br>status:select*{3} = Pilih / Aktif / Tidak Aktif<br>beban_biaya:select*{3} = Pilih / Dibebankan Ke Pelanggan / Dibebankan Ke Perusahaan<br>password:password<br>privatekey:text<br>merchantcode:text<br>pin:text<br>email_api:text<br>pass_api:password<br>biaya_admin:number

### `add-pengaturan-hadiah-poin`

Judul: Tambah Data

Form 1 [post (self)]: id_lokasi:select{6} = Pilih Lokasi / Pilih Lokasi / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 <br>nama_hadiah:text*<br>total_poin:number*<br>keterangan:text*<br>jumlah_stok:number*<br>foto_hadiah:file

### `add-pengumuman`

Judul: Tambah Data

Form 1 [post (self)]: id_lokasi:select*{21}<br>id_lokasi_detail:select{6} = Pilih Lokasi / Semua Lokasi / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya 083142830676 <br>id_tipe_pembayaran:select{14}<br>id_sales:select{7}<br>id_router:select{4} = Pilih / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_odp:select{1} = Pilih<br>id_odc:select{1} = Pilih<br>id_olt:select{1} = Pilih<br>nama_pengumuman:text*<br>bulan_filter:text<br>foto_ktp:file<br>isi_pengumuman:textarea

### `add-warga`

Judul: Form Entry Data Pelanggan

Form 1 [post (self)]: jns_pelanggan:select*{4} = Pilih / Pelanggan Lama / Pelanggan Baru / Pelanggan Survey<br>id_lokasi:select*{6} = MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya-083142830676 / Pilih Lokasi / MURANET GRAHA<br>id_router:select{4} = Pilih Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>status_koneksi:select{0}<br>jns_koneksi:select{6} = Pilih Jenis Koneksi / Dynamic / Static / PPPOE / Hotspot / IPBiddings<br>metode_pembuatan:select{4} = Pilih Metode Pembuatan / Buat Baru / Sinkronisasi / Manual<br>id_router1:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_router11:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>server_binding:select{1} = Pilih Server<br>profile:select{1} = Pilih Profile<br>id_router2:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_router3:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>parent:select{1} = Pilih Parent<br>id_router4:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_router5:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>profilhotspot:select{1} = Pilih Profil<br>id_router6:select{4} = Pilih Lagi Router / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>nama_hotspot:select{1} = Pilih User Hotspot<br>id_tipe_pembayaran:select*{13}<br>prorate:select{3} = Pilih Prorate / YA / Tidak<br>jns_blokir:select{3} = Pilih Jenis Pemblokiran / Manual / Otomatis<br>tgl_jatuh_tempo:select{33}<br>ppn:select*{3} = Pilih PPN / YA / Tidak Ada<br>lain-lain:select{15}<br>metode_insentif:select{3} = Pilih / Presentase / Nominal<br>id_sales:select*{7}<br>status:select*{2} = Aktif / Tidak Aktif<br>id pelanggan:text<br>nama_warga:text*<br>tlp:number*<br>tlp2:number<br>email:email<br>nik:number<br>foto_ktp:file<br>nomor_rumah:text<br>blok:text<br>dusun:text<br>kelurahan:text<br>kecamatan:text<br>titik_lokasi:text<br>usersecret:text<br>password_secret:text<br>local_address:text<br>remote_address:text<br>usersecret2:text<br>nama_queues:text<br>target_ip:text<br>max_upload_download:text<br>burst_limit:text<br>burst_threshold_limit:text<br>limit_download_upload:text<br>priority:text<br>bucket_size:text<br>kabupaten:text<br>nama_queues4:text<br>nama_userhotspot:text<br>password_hotspot:text<br>nama_onu:text<br>provinsi:text<br>modul_olt:text<br>olt_port:text<br>index_onu:text<br>sn_onu:text<br>tgl_registrasi:date*<br>insentif_sales:text<br>alamat:textarea*<br>catatan:textarea

Tombol/aksi: Find Location · View In Map · &times; · Selesai

### `cek-wa`

Judul: Validasi Pengiriman Tagihan

Form 1 [post (self)]: jns_tagihan:select*{3} = Pilih / Serentak / Sesuai Tanggal Jatuh Tempo<br>tgl_awal:date*

### `corporate`

### `data-lokasi`

Judul: Data Lokasi

Tabel 1 (4 baris): No | Nama Lokasi | Alamat | Tlp | Metode Insentif | Insentif | ID Group | Jumlah Pelanggan | Aksi

### `data-payment-gateway`

Judul: Data Payment Gateway

Tabel 1: No | Metode | Jenis | Status | Aksi

### `data-payment-gateway-ppob`

Judul: Data Payment Gateway PPOB

Tabel 1: No | Metode | Jenis | Status | Aksi

### `data-pengaturan-hadiah-poin`

Judul: Data Pengaturan Hadiah Poin

Tabel 1: No | Foto | Nama Hadiah | Ketentuan Nominal Poin | Jumlah Stok | Keterangan | STO | Aksi

### `data-sudah-bayar`

Judul: Data Pelanggan Sudah Membayar

Tabel 1: No | Cetak Bukti | Cetak Invoice | No Invoice | ID Pelanggan | Nama Pelanggan | Alamat | Tlp | Nominal Harus Dibayar | Nominal Pembayaran | Bulan | Status Pembayaran | Nama Sales | Keterangan | Waktu Entry | Bukti Pembayaran | Aksi

Tabel 2: Total

### `edit-lokasi`

Judul: Ubah Data

Form 1 [post (self)]: metode_insentif:select{2} = Presentase / Nominal<br>ubah1:select{2} = Ya / Tidak<br>id_lokasi:text<br>nama_lokasi:text<br>tlp_lokasi:number<br>insentif_sales:text<br>group_wa:text<br>alamat_lokasi:textarea*

### `edit-pengumuman`

Judul: Ubah Data

Form 1 [post (self)]: id_lokasi:select{21}<br>id_lokasi_detail:select{6} = Pilih Lokasi / Semua Lokasi / MURANET GRAHA SA Lt 9 Jl. Raya gubeng no. 19-21 surabaya 083142830676 <br>id_sales:select{7}<br>id_router:select{4} = Pilih / AKT-BATU / AKT_WOODVILLE / AKT_GREENPARK<br>id_tipe_pembayaran:select{14}<br>id_odp:select{1} = Pilih<br>id_odc:select{1} = Pilih<br>id_olt:select{1} = Pilih<br>nama_pengumuman:text*<br>bulan_filter:text<br>foto_ktp:file<br>isi_pengumuman:textarea

