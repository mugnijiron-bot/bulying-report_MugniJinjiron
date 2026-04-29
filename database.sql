-- ============================================
-- SISTEM LAPORAN PERUNDUNGAN SISWA
-- Database: MySQL / MariaDB
-- ============================================

CREATE DATABASE IF NOT EXISTS db_perundungan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_perundungan;

-- Tabel laporan utama
CREATE TABLE IF NOT EXISTS laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_laporan VARCHAR(20) NOT NULL UNIQUE,
    nama_pelapor VARCHAR(100) DEFAULT 'Anonim',
    kelas_pelapor VARCHAR(20) DEFAULT '-',
    nama_korban VARCHAR(100) NOT NULL,
    kelas_korban VARCHAR(20) NOT NULL,
    nama_pelaku VARCHAR(100) NOT NULL,
    kelas_pelaku VARCHAR(20) DEFAULT 'Tidak diketahui',
    jenis_perundungan ENUM('Fisik','Verbal','Siber','Sosial','Seksual') NOT NULL,
    tingkat_keparahan ENUM('Rendah','Sedang','Tinggi') NOT NULL,
    tanggal_kejadian DATE NOT NULL,
    lokasi_kejadian VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    status ENUM('Pending','Diproses','Selesai') DEFAULT 'Pending',
    catatan_admin TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel admin
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert admin default (password: admin123)
INSERT INTO admin (username, password, nama_lengkap, email) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@sekolah.sch.id');

-- Data contoh laporan
INSERT INTO laporan (kode_laporan, nama_pelapor, kelas_pelapor, nama_korban, kelas_korban, nama_pelaku, kelas_pelaku, jenis_perundungan, tingkat_keparahan, tanggal_kejadian, lokasi_kejadian, deskripsi, status) VALUES
('LPR-0001', 'Anonim', '-', 'Budi Santoso', '8A', 'Andi Pratama', '8B', 'Fisik', 'Sedang', '2025-01-10', 'Koridor', 'Korban sering didorong dan dipukul oleh pelaku saat di koridor sekolah setelah jam pelajaran.', 'Diproses'),
('LPR-0002', 'Siti Rahayu', '9C', 'Dewi Lestari', '7A', 'Kelompok anak 9B', '9B', 'Verbal', 'Tinggi', '2025-01-12', 'Kantin', 'Korban terus-menerus diejek dan dihina di kantin sekolah setiap hari istirahat selama 2 minggu.', 'Pending'),
('LPR-0003', 'Anonim', '-', 'Rizki Firmansyah', '8C', 'Tidak diketahui', 'Tidak diketahui', 'Siber', 'Sedang', '2025-01-14', 'Online/Medsos', 'Akun media sosial korban diserang komentar negatif dan foto korban disebarkan tanpa izin.', 'Selesai');
