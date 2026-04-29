## Fitur Aplikasi

### Dashboard
- Ringkasan statistik laporan (total, pending, diproses, selesai)
- Tabel laporan terbaru yang belum ditangani

### Daftar Laporan
- Tampilkan semua laporan dalam format tabel
- Filter berdasarkan jenis, tingkat keparahan, dan status
- Pencarian berdasarkan nama korban/pelaku/kode
- Lihat detail lengkap setiap laporan
- Ubah status laporan (Pending → Diproses → Selesai)
- Tambah catatan tindak lanjut admin
- Hapus laporan

### Buat Laporan
- Form laporan lengkap dengan validasi
- Pelapor bisa anonim (nama pelapor opsional)
- Data korban, pelaku, jenis, tingkat, lokasi, dan deskripsi
- Kode laporan otomatis digenerate

### Statistik
- Ringkasan angka (total, pending, diproses, selesai)
- Grafik batang distribusi jenis perundungan
- Grafik batang distribusi lokasi kejadian

---

## Struktur Database

### Tabel `laporan`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT AUTO_INCREMENT | Primary key |
| kode_laporan | VARCHAR(20) | Kode unik (LPR-0001) |
| nama_pelapor | VARCHAR(100) | Nama pelapor / Anonim |
| kelas_pelapor | VARCHAR(20) | Kelas pelapor |
| nama_korban | VARCHAR(100) | Nama korban (wajib) |
| kelas_korban | VARCHAR(20) | Kelas korban (wajib) |
| nama_pelaku | VARCHAR(100) | Nama pelaku |
| kelas_pelaku | VARCHAR(20) | Kelas pelaku |
| jenis_perundungan | ENUM | Fisik/Verbal/Siber/Sosial/Seksual |
| tingkat_keparahan | ENUM | Rendah/Sedang/Tinggi |
| tanggal_kejadian | DATE | Tanggal kejadian |
| lokasi_kejadian | VARCHAR(100) | Lokasi kejadian |
| deskripsi | TEXT | Deskripsi detail |
| status | ENUM | Pending/Diproses/Selesai |
| catatan_admin | TEXT | Catatan tindak lanjut |
| created_at | TIMESTAMP | Waktu laporan dibuat |
| updated_at | TIMESTAMP | Waktu terakhir diupdate |

### Tabel `admin`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT AUTO_INCREMENT | Primary key |
| username | VARCHAR(50) | Username login |
| password | VARCHAR(255) | Password (bcrypt) |
| nama_lengkap | VARCHAR(100) | Nama lengkap admin |
| email | VARCHAR(100) | Email admin |

---

## API Endpoint

### Laporan
- `GET api/laporan.php` — Ambil semua laporan (dengan filter opsional)
- `GET api/laporan.php?action=detail&id={id}` — Detail satu laporan
- `GET api/laporan.php?action=statistik` — Data statistik
- `POST api/laporan.php` — Tambah laporan baru
- `PUT api/laporan.php` — Update status laporan
- `DELETE api/laporan.php` — Hapus laporan

### Auth
- `POST api/auth.php` — Login
- `GET api/auth.php?action=logout` — Logout
- `GET api/auth.php?action=check` — Cek status login

---

## Mengganti Password Admin
1. Buka phpMyAdmin → database `db_perundungan` → tabel `admin`
2. Atau gunakan PHP untuk generate hash baru:
   ```php
   echo password_hash('passwordbaru', PASSWORD_DEFAULT);
   ```
3. Update kolom `password` dengan hash yang baru

---

## Troubleshooting

**"Koneksi database gagal"**
→ Pastikan MySQL aktif di XAMPP dan pengaturan di config.php benar

**"Halaman tidak bisa diakses"**
→ Pastikan Apache aktif dan folder berada di htdocs

**Login gagal dengan akun default**
→ Jalankan ulang database.sql untuk reset tabel admin

---

Dibuat untuk keperluan pendidikan dan keamanan sekolah.
