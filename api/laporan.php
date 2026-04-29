<?php
require_once '../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'statistik') getStatistik();
        elseif ($action === 'detail') getDetail();
        else getLaporan();
        break;
    case 'POST':
        tambahLaporan();
        break;
    case 'PUT':
        updateLaporan();
        break;
    case 'DELETE':
        hapusLaporan();
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Method tidak didukung'], 405);
}

// GET semua laporan dengan filter
function getLaporan() {
    $db = getDB();
    $where = [];
    $params = [];

    if (!empty($_GET['jenis'])) {
        $where[] = "jenis_perundungan = ?";
        $params[] = $_GET['jenis'];
    }
    if (!empty($_GET['tingkat'])) {
        $where[] = "tingkat_keparahan = ?";
        $params[] = $_GET['tingkat'];
    }
    if (!empty($_GET['status'])) {
        $where[] = "status = ?";
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['search'])) {
        $where[] = "(nama_korban LIKE ? OR nama_pelaku LIKE ? OR kode_laporan LIKE ?)";
        $s = '%' . $_GET['search'] . '%';
        $params = array_merge($params, [$s, $s, $s]);
    }

    $sql = "SELECT * FROM laporan";
    if ($where) $sql .= " WHERE " . implode(" AND ", $where);
    $sql .= " ORDER BY created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    jsonResponse(['success' => true, 'data' => $data, 'total' => count($data)]);
}

// GET detail satu laporan
function getDetail() {
    $db = getDB();
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['success' => false, 'message' => 'ID diperlukan'], 400);

    $stmt = $db->prepare("SELECT * FROM laporan WHERE id = ? OR kode_laporan = ?");
    $stmt->execute([$id, $id]);
    $data = $stmt->fetch();

    if (!$data) jsonResponse(['success' => false, 'message' => 'Laporan tidak ditemukan'], 404);
    jsonResponse(['success' => true, 'data' => $data]);
}

// POST tambah laporan baru
function tambahLaporan() {
    $db = getDB();
    $body = json_decode(file_get_contents('php://input'), true);

    $required = ['nama_korban', 'kelas_korban', 'nama_pelaku', 'jenis_perundungan', 'tingkat_keparahan', 'tanggal_kejadian', 'lokasi_kejadian', 'deskripsi'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            jsonResponse(['success' => false, 'message' => "Field '$field' wajib diisi"], 400);
        }
    }

    $kode = generateKode();
    $stmt = $db->prepare("
        INSERT INTO laporan (kode_laporan, nama_pelapor, kelas_pelapor, nama_korban, kelas_korban, nama_pelaku, kelas_pelaku, jenis_perundungan, tingkat_keparahan, tanggal_kejadian, lokasi_kejadian, deskripsi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $kode,
        $body['nama_pelapor'] ?? 'Anonim',
        $body['kelas_pelapor'] ?? '-',
        $body['nama_korban'],
        $body['kelas_korban'],
        $body['nama_pelaku'],
        $body['kelas_pelaku'] ?? 'Tidak diketahui',
        $body['jenis_perundungan'],
        $body['tingkat_keparahan'],
        $body['tanggal_kejadian'],
        $body['lokasi_kejadian'],
        $body['deskripsi']
    ]);

    jsonResponse(['success' => true, 'message' => 'Laporan berhasil dikirim', 'kode' => $kode]);
}

// PUT update status laporan
function updateLaporan() {
    $db = getDB();
    $body = json_decode(file_get_contents('php://input'), true);
    $id = $body['id'] ?? '';

    if (!$id) jsonResponse(['success' => false, 'message' => 'ID diperlukan'], 400);

    $fields = [];
    $params = [];

    if (isset($body['status'])) {
        $fields[] = "status = ?";
        $params[] = $body['status'];
    }
    if (isset($body['catatan_admin'])) {
        $fields[] = "catatan_admin = ?";
        $params[] = $body['catatan_admin'];
    }

    if (!$fields) jsonResponse(['success' => false, 'message' => 'Tidak ada data yang diupdate'], 400);

    $params[] = $id;
    $stmt = $db->prepare("UPDATE laporan SET " . implode(", ", $fields) . " WHERE id = ?");
    $stmt->execute($params);

    jsonResponse(['success' => true, 'message' => 'Laporan berhasil diupdate']);
}

// DELETE hapus laporan
function hapusLaporan() {
    $db = getDB();
    $body = json_decode(file_get_contents('php://input'), true);
    $id = $body['id'] ?? $_GET['id'] ?? '';

    if (!$id) jsonResponse(['success' => false, 'message' => 'ID diperlukan'], 400);

    $stmt = $db->prepare("DELETE FROM laporan WHERE id = ?");
    $stmt->execute([$id]);

    jsonResponse(['success' => true, 'message' => 'Laporan berhasil dihapus']);
}

// GET statistik
function getStatistik() {
    $db = getDB();

    $total = $db->query("SELECT COUNT(*) FROM laporan")->fetchColumn();
    $pending = $db->query("SELECT COUNT(*) FROM laporan WHERE status='Pending'")->fetchColumn();
    $diproses = $db->query("SELECT COUNT(*) FROM laporan WHERE status='Diproses'")->fetchColumn();
    $selesai = $db->query("SELECT COUNT(*) FROM laporan WHERE status='Selesai'")->fetchColumn();
    $tinggi = $db->query("SELECT COUNT(*) FROM laporan WHERE tingkat_keparahan='Tinggi'")->fetchColumn();

    $byJenis = $db->query("SELECT jenis_perundungan as label, COUNT(*) as value FROM laporan GROUP BY jenis_perundungan ORDER BY value DESC")->fetchAll();
    $byLokasi = $db->query("SELECT lokasi_kejadian as label, COUNT(*) as value FROM laporan GROUP BY lokasi_kejadian ORDER BY value DESC LIMIT 8")->fetchAll();
    $byBulan = $db->query("SELECT DATE_FORMAT(created_at,'%Y-%m') as bulan, COUNT(*) as total FROM laporan GROUP BY bulan ORDER BY bulan DESC LIMIT 6")->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => [
            'total' => (int)$total,
            'pending' => (int)$pending,
            'diproses' => (int)$diproses,
            'selesai' => (int)$selesai,
            'tinggi' => (int)$tinggi,
            'by_jenis' => $byJenis,
            'by_lokasi' => $byLokasi,
            'by_bulan' => $byBulan
        ]
    ]);
}
