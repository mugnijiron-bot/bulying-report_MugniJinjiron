// ============================================
// SISTEM LAPORAN PERUNDUNGAN - MAIN JS
// ============================================

const API = {
  laporan: 'api/laporan.php',
  auth: 'api/auth.php'
};

// ---- TOAST ----
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3000);
}

// ---- NAVIGATION ----
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`[data-page="${page}"]`);
  if (nav) nav.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Ringkasan laporan perundungan'],
    laporan: ['Manajemen Laporan', 'Lihat dan kelola semua laporan'],
    tambah: ['Buat Laporan Baru', 'Laporkan kasus perundungan'],
    statistik: ['Statistik', 'Analisis data perundungan']
  };
  if (titles[page]) {
    document.getElementById('topbar-title').textContent = titles[page][0];
    document.getElementById('topbar-sub').textContent = titles[page][1];
  }

  if (page === 'dashboard') loadDashboard();
  if (page === 'laporan') loadLaporan();
  if (page === 'statistik') loadStatistik();
  if (page === 'tambah') resetForm();
}

// ---- AUTH ----
async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  if (!username || !password) { toast('Isi username dan password', 'error'); return; }

  const btn = document.getElementById('btn-login');
  btn.textContent = 'Masuk...';
  btn.disabled = true;

  try {
    const res = await fetch(API.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('admin-name').textContent = data.nama;
      document.getElementById('admin-initial').textContent = data.nama.charAt(0).toUpperCase();
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('app-page').style.display = 'flex';
      showPage('dashboard');
    } else {
      toast(data.message, 'error');
    }
  } catch {
    toast('Gagal terhubung ke server', 'error');
  } finally {
    btn.textContent = 'Masuk';
    btn.disabled = false;
  }
}

async function logout() {
  await fetch(API.auth + '?action=logout');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-page').style.display = 'none';
  document.getElementById('login-password').value = '';
}

// ---- DASHBOARD ----
async function loadDashboard() {
  try {
    const res = await fetch(API.laporan + '?action=statistik');
    const data = await res.json();
    if (!data.success) return;
    const s = data.data;
    document.getElementById('d-total').textContent = s.total;
    document.getElementById('d-pending').textContent = s.pending;
    document.getElementById('d-diproses').textContent = s.diproses;
    document.getElementById('d-selesai').textContent = s.selesai;
    document.getElementById('d-tinggi').textContent = s.tinggi;

    // Load recent reports
    const res2 = await fetch(API.laporan + '?status=Pending');
    const data2 = await res2.json();
    renderRecentTable(data2.data.slice(0, 5));
  } catch { toast('Gagal memuat dashboard', 'error'); }
}

function renderRecentTable(data) {
  const tbody = document.getElementById('recent-tbody');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Tidak ada laporan pending</p></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(d => `
    <tr>
      <td><span style="font-family:monospace;font-size:12px">${d.kode_laporan}</span></td>
      <td>${d.nama_korban} <span style="font-size:11px;color:#9ca3af">${d.kelas_korban}</span></td>
      <td>${d.nama_pelaku}</td>
      <td>${badgeJenis(d.jenis_perundungan)}</td>
      <td>${badgeTingkat(d.tingkat_keparahan)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="viewDetail(${d.id})">Detail</button></td>
    </tr>
  `).join('');
}

// ---- LOAD LAPORAN ----
async function loadLaporan() {
  const jenis = document.getElementById('filter-jenis')?.value || '';
  const tingkat = document.getElementById('filter-tingkat')?.value || '';
  const status = document.getElementById('filter-status')?.value || '';
  const search = document.getElementById('filter-search')?.value || '';

  const params = new URLSearchParams();
  if (jenis) params.append('jenis', jenis);
  if (tingkat) params.append('tingkat', tingkat);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const tbody = document.getElementById('laporan-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af;font-size:13px">Memuat data...</td></tr>';

  try {
    const res = await fetch(API.laporan + '?' + params.toString());
    const data = await res.json();
    document.getElementById('jumlah-laporan').textContent = data.total + ' laporan ditemukan';

    if (!data.data.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <p>Tidak ada laporan ditemukan</p>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = data.data.map(d => `
      <tr>
        <td><span style="font-family:monospace;font-size:12px;color:#6b7280">${d.kode_laporan}</span></td>
        <td>${escHtml(d.nama_korban)}<br><span style="font-size:11px;color:#9ca3af">${d.kelas_korban}</span></td>
        <td>${escHtml(d.nama_pelaku)}<br><span style="font-size:11px;color:#9ca3af">${d.kelas_pelaku}</span></td>
        <td>${badgeJenis(d.jenis_perundungan)}</td>
        <td>${badgeTingkat(d.tingkat_keparahan)}</td>
        <td>${badgeStatus(d.status)}</td>
        <td style="font-size:12px;color:#9ca3af">${formatDate(d.tanggal_kejadian)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm" onclick="viewDetail(${d.id})">Lihat</button>
            <button class="btn btn-danger-ghost btn-sm" onclick="hapusLaporan(${d.id}, '${d.kode_laporan}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch { toast('Gagal memuat data', 'error'); }
}

// ---- VIEW DETAIL ----
async function viewDetail(id) {
  const res = await fetch(API.laporan + '?action=detail&id=' + id);
  const data = await res.json();
  if (!data.success) { toast('Laporan tidak ditemukan', 'error'); return; }
  const d = data.data;

  document.getElementById('modal-content').innerHTML = `
    <div class="detail-row"><span class="detail-key">Kode Laporan</span><span class="detail-val" style="font-family:monospace">${d.kode_laporan}</span></div>
    <div class="detail-row"><span class="detail-key">Tanggal Lapor</span><span class="detail-val">${formatDate(d.created_at)}</span></div>
    <div class="detail-row"><span class="detail-key">Pelapor</span><span class="detail-val">${escHtml(d.nama_pelapor)}</span></div>
    <div class="detail-row"><span class="detail-key">Korban</span><span class="detail-val">${escHtml(d.nama_korban)} <span style="color:#9ca3af">(${d.kelas_korban})</span></span></div>
    <div class="detail-row"><span class="detail-key">Pelaku</span><span class="detail-val">${escHtml(d.nama_pelaku)} <span style="color:#9ca3af">(${d.kelas_pelaku})</span></span></div>
    <div class="detail-row"><span class="detail-key">Jenis</span><span class="detail-val">${badgeJenis(d.jenis_perundungan)}</span></div>
    <div class="detail-row"><span class="detail-key">Tingkat</span><span class="detail-val">${badgeTingkat(d.tingkat_keparahan)}</span></div>
    <div class="detail-row"><span class="detail-key">Tanggal Kejadian</span><span class="detail-val">${formatDate(d.tanggal_kejadian)}</span></div>
    <div class="detail-row"><span class="detail-key">Lokasi</span><span class="detail-val">${escHtml(d.lokasi_kejadian)}</span></div>
    <div class="detail-row"><span class="detail-key">Status</span><span class="detail-val">${badgeStatus(d.status)}</span></div>
    <div style="margin-top:16px">
      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Deskripsi Kejadian</div>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;font-size:13.5px;line-height:1.7">${escHtml(d.deskripsi)}</div>
    </div>
    <div style="margin-top:18px">
      <label style="font-size:12.5px;font-weight:500">Ubah Status</label>
      <select id="modal-status" style="margin-top:6px">
        <option ${d.status==='Pending'?'selected':''}>Pending</option>
        <option ${d.status==='Diproses'?'selected':''}>Diproses</option>
        <option ${d.status==='Selesai'?'selected':''}>Selesai</option>
      </select>
      <label style="font-size:12.5px;font-weight:500;margin-top:12px;display:block">Catatan Admin</label>
      <textarea id="modal-catatan" placeholder="Catatan tindak lanjut..." style="margin-top:6px">${d.catatan_admin || ''}</textarea>
      <button class="btn btn-teal btn-full" style="margin-top:10px" onclick="updateStatus(${d.id})">Simpan Perubahan</button>
    </div>
  `;
  document.getElementById('modal-id').value = id;
  document.getElementById('modal-overlay').classList.add('open');
}

async function updateStatus(id) {
  const status = document.getElementById('modal-status').value;
  const catatan = document.getElementById('modal-catatan').value;
  try {
    const res = await fetch(API.laporan, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, catatan_admin: catatan })
    });
    const data = await res.json();
    if (data.success) {
      toast('Status berhasil diperbarui', 'success');
      closeModal();
      loadLaporan();
      if (document.getElementById('page-dashboard').classList.contains('active')) loadDashboard();
    } else { toast(data.message, 'error'); }
  } catch { toast('Gagal memperbarui', 'error'); }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ---- HAPUS ----
async function hapusLaporan(id, kode) {
  if (!confirm(`Hapus laporan ${kode}?\nTindakan ini tidak dapat dibatalkan.`)) return;
  try {
    const res = await fetch(API.laporan, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) { toast('Laporan dihapus', 'success'); loadLaporan(); }
    else { toast(data.message, 'error'); }
  } catch { toast('Gagal menghapus', 'error'); }
}

// ---- TAMBAH LAPORAN ----
function resetForm() {
  document.getElementById('form-laporan').reset();
  document.getElementById('f-tanggal').valueAsDate = new Date();
  document.getElementById('form-result').style.display = 'none';
}

async function submitLaporan() {
  const get = id => document.getElementById(id).value.trim();
  const body = {
    nama_pelapor: get('f-pelapor') || 'Anonim',
    kelas_pelapor: get('f-kelas-pelapor'),
    nama_korban: get('f-korban'),
    kelas_korban: get('f-kelas-korban'),
    nama_pelaku: get('f-pelaku'),
    kelas_pelaku: get('f-kelas-pelaku'),
    jenis_perundungan: get('f-jenis'),
    tingkat_keparahan: get('f-tingkat'),
    tanggal_kejadian: get('f-tanggal'),
    lokasi_kejadian: get('f-lokasi'),
    deskripsi: get('f-deskripsi')
  };

  const required = ['nama_korban','kelas_korban','nama_pelaku','jenis_perundungan','tingkat_keparahan','tanggal_kejadian','lokasi_kejadian','deskripsi'];
  for (const f of required) {
    if (!body[f]) { toast('Harap lengkapi semua field wajib (*)', 'error'); return; }
  }

  const btn = document.getElementById('btn-submit');
  btn.textContent = 'Mengirim...'; btn.disabled = true;

  try {
    const res = await fetch(API.laporan, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      const el = document.getElementById('form-result');
      document.getElementById('result-kode').textContent = data.kode;
      el.style.display = 'block';
      el.scrollIntoView({ behavior: 'smooth' });
      toast('Laporan berhasil dikirim!', 'success');
      document.getElementById('form-laporan').reset();
      document.getElementById('f-tanggal').valueAsDate = new Date();
    } else { toast(data.message, 'error'); }
  } catch { toast('Gagal mengirim laporan', 'error'); }
  finally { btn.textContent = 'Kirim Laporan'; btn.disabled = false; }
}

// ---- STATISTIK ----
async function loadStatistik() {
  try {
    const res = await fetch(API.laporan + '?action=statistik');
    const data = await res.json();
    if (!data.success) return;
    const s = data.data;

    document.getElementById('s-total').textContent = s.total;
    document.getElementById('s-pending').textContent = s.pending;
    document.getElementById('s-diproses').textContent = s.diproses;
    document.getElementById('s-selesai').textContent = s.selesai;
    document.getElementById('s-tinggi').textContent = s.tinggi;

    renderBarChart('chart-jenis', s.by_jenis, ['#e63946','#2563eb','#7c3aed','#059669','#d97706']);
    renderBarChart('chart-lokasi', s.by_lokasi, ['#0d7377','#0d7377','#0d7377','#0d7377','#0d7377','#0d7377','#0d7377','#0d7377']);
  } catch { toast('Gagal memuat statistik', 'error'); }
}

function renderBarChart(containerId, data, colors) {
  const el = document.getElementById(containerId);
  if (!data.length) { el.innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:20px">Belum ada data</p>'; return; }
  const max = Math.max(...data.map(d => d.value));
  el.innerHTML = '<div class="bar-chart">' + data.map((d, i) => `
    <div class="bar-row">
      <div class="bar-label">${escHtml(d.label)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${max ? Math.round(d.value/max*100) : 0}%;background:${colors[i % colors.length]}">
          <span class="bar-count">${d.value}</span>
        </div>
      </div>
    </div>
  `).join('') + '</div>';
}

// ---- HELPERS ----
function badgeJenis(j) {
  const m = {Fisik:'fisik',Verbal:'verbal',Siber:'siber',Sosial:'sosial',Seksual:'seksual'};
  return `<span class="badge badge-${m[j]||'fisik'}">${j}</span>`;
}
function badgeTingkat(t) {
  const m = {Rendah:'rendah',Sedang:'sedang',Tinggi:'tinggi'};
  return `<span class="badge badge-${m[t]||'rendah'}">${t}</span>`;
}
function badgeStatus(s) {
  const m = {Pending:'pending',Diproses:'diproses',Selesai:'selesai'};
  return `<span class="badge badge-${m[s]||'pending'}">${s}</span>`;
}
function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}
function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return d.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
}

// ---- ENTER KEY ON LOGIN ----
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-page').style.display !== 'none') login();
});
