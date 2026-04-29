<?php
session_start();
require_once '../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Logout berhasil']);
}

if ($action === 'check') {
    jsonResponse(['success' => true, 'loggedIn' => isset($_SESSION['admin_id']), 'nama' => $_SESSION['admin_nama'] ?? '']);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        jsonResponse(['success' => false, 'message' => 'Username dan password wajib diisi'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        jsonResponse(['success' => false, 'message' => 'Username atau password salah'], 401);
    }

    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_nama'] = $admin['nama_lengkap'];
    $_SESSION['admin_username'] = $admin['username'];

    jsonResponse(['success' => true, 'message' => 'Login berhasil', 'nama' => $admin['nama_lengkap']]);
}

jsonResponse(['success' => false, 'message' => 'Method tidak didukung'], 405);
