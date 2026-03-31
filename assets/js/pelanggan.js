/* =========================
   PELANGGAN FUNCTIONS
========================= */

let pelangganDB = [
  { id: "2001", nama: "Andi", tanggal: "2024-01-15", note: "Meteran di sebelah kiri gerbang utama" },
  { id: "2002", nama: "Budi", tanggal: "2024-02-20", note: "Meteran sejajar dengan tembok pagar" },
  { id: "2003", nama: "Sari", tanggal: "2024-03-05", note: "Meteran di belakang halaman dekat taman" }
];

function switchPelangganTab(tabId) {
  // Update Buttons
  ['daftar', 'tambah', 'edit', 'hapus'].forEach(id => {
    document.getElementById(`tab-${id}`).classList.remove('active');
    document.getElementById(`section-${id}`).classList.remove('active');
  });
  
  document.getElementById(`tab-${tabId}`).classList.add('active');
  document.getElementById(`section-${tabId}`).classList.add('active');

  if (tabId === 'daftar') {
    loadDaftarPelanggan();
  }
}

function loadDaftarPelanggan() {
  const result = document.getElementById("daftarResult");
  const queryElem = document.getElementById("cariDaftar");
  const query = queryElem ? queryElem.value.trim().toLowerCase() : "";

  let filteredDB = pelangganDB;
  if (query) {
    filteredDB = pelangganDB.filter(user => 
      user.id.toLowerCase().includes(query) || 
      user.nama.toLowerCase().includes(query)
    );
  }

  if (filteredDB.length === 0) {
    result.innerHTML = `<p style="text-align:center;color:#6b7280;margin-top:20px;">Tidak ada data pelanggan${query ? ' yang cocok' : ''}.</p>`;
    return;
  }

  let html = "";
  filteredDB.forEach(user => {
    html += `
      <div class="list-card">
        <h3>${user.nama}</h3>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Tanggal Pasang:</strong> ${user.tanggal}</p>
        ${user.note ? `<div class="note-badge">📍 ${user.note}</div>` : ''}
      </div>
    `;
  });
  result.innerHTML = html;
}

function tambahPelanggan() {
  const id = document.getElementById("addId").value.trim();
  const nama = document.getElementById("addNama").value.trim();
  const tanggal = document.getElementById("addTanggal").value;
  const note = document.getElementById("addNote").value.trim();

  if (!id || !nama || !tanggal) {
    alert("Harap lengkapi Data (ID, Nama, Tanggal)!");
    return;
  }

  const existing = pelangganDB.find(u => u.id === id);
  if (existing) {
    alert("ID Pelanggan sudah terdaftar!");
    return;
  }

  pelangganDB.push({ id, nama, tanggal, note });
  alert("Pelanggan berhasil ditambahkan!");
  
  // Clear form
  document.getElementById("addId").value = "";
  document.getElementById("addNama").value = "";
  document.getElementById("addTanggal").value = "";
  document.getElementById("addNote").value = "";

  switchPelangganTab('daftar');
}

function cariEditPelanggan() {
  const query = document.getElementById("editSearchId").value.trim().toLowerCase();
  const user = pelangganDB.find(u => u.id.toLowerCase() === query || u.nama.toLowerCase().includes(query));
  
  const form = document.getElementById("editForm");
  if (user) {
    form.style.display = "block";
    document.getElementById("editNama").value = user.nama;
    document.getElementById("editTanggal").value = user.tanggal;
    document.getElementById("editNote").value = user.note;
    // Simpan id yang sedang diedit di dataset
    form.dataset.editId = user.id;
  } else {
    form.style.display = "none";
    alert("Pelanggan tidak ditemukan!");
  }
}

function simpanEditPelanggan() {
  const form = document.getElementById("editForm");
  const id = form.dataset.editId;
  const index = pelangganDB.findIndex(u => u.id === id);

  if (index !== -1) {
    pelangganDB[index].nama = document.getElementById("editNama").value.trim();
    pelangganDB[index].tanggal = document.getElementById("editTanggal").value;
    pelangganDB[index].note = document.getElementById("editNote").value.trim();
    
    alert("Data berhasil diupdate!");
    document.getElementById("editSearchId").value = "";
    form.style.display = "none";
    switchPelangganTab('daftar');
  }
}

function cariHapusPelanggan() {
  const query = document.getElementById("hapusSearchId").value.trim().toLowerCase();
  const user = pelangganDB.find(u => u.id.toLowerCase() === query || u.nama.toLowerCase().includes(query));
  
  const detail = document.getElementById("hapusDetail");
  if (user) {
    detail.style.display = "block";
    document.getElementById("hapusNamaDisplay").innerText = user.nama;
    document.getElementById("hapusIdDisplay").innerText = user.id;
    document.getElementById("hapusTanggalDisplay").innerText = user.tanggal;
    detail.dataset.hapusId = user.id;
  } else {
    detail.style.display = "none";
    alert("Pelanggan tidak ditemukan!");
  }
}

function hapusPelanggan() {
  const detail = document.getElementById("hapusDetail");
  const id = detail.dataset.hapusId;

  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus pelanggan ID: ${id}?`);
  if (confirmDelete) {
    pelangganDB = pelangganDB.filter(u => u.id !== id);
    alert("Pelanggan berhasil dihapus!");
    document.getElementById("hapusSearchId").value = "";
    detail.style.display = "none";
    switchPelangganTab('daftar');
  }
}

// Auto load daftar pelanggan jika di halaman pelanggan
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("daftarResult")) {
    loadDaftarPelanggan();
  }
});
