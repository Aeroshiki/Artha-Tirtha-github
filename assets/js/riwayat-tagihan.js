const STORAGE_KEY_LISTRIK = 'Pdam_TagihanListrik_DB';

// Initialize structure
function initListrikDB() {
    if(!localStorage.getItem(STORAGE_KEY_LISTRIK)) {
        localStorage.setItem(STORAGE_KEY_LISTRIK, JSON.stringify([]));
    }
}

// Generate ID Helper
function generateListrikId() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    return 'LST-' + String(data.length + 1).padStart(3, '0');
}

// Format Currency
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

// Format input text for Rupiah
function formatRupiahInput(input) {
    let value = input.value.replace(/[^,\d]/g, '').toString();
    const split = value.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    input.value = rupiah;
}

// Tab Switcher
function switchTabListrik(tabId) {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none'; // Ensure reset
    });

    document.getElementById('tab-' + tabId).classList.add('active');
    
    const targetSection = document.getElementById('section-' + tabId);
    targetSection.style.display = 'block';
    
    // Slight delay for animation class if needed
    setTimeout(() => {
        targetSection.classList.add('active');
    }, 10);

    if(tabId === 'daftar') loadDaftarListrik();
    if(tabId === 'tambah') {
        // Auto fill tahun
        document.getElementById('addTahun').value = new Date().getFullYear();
    }

    // Reset Forms
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('hapusDetail').style.display = 'none';
}

// ========================
// DAFTAR
// ========================
function loadDaftarListrik() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    const cari = document.getElementById('cariDaftarListrik').value.toLowerCase();
    const resultDiv = document.getElementById('daftarResultListrik');
    resultDiv.innerHTML = '';

    const sortedData = data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    const filtered = sortedData.filter(item => 
        item.id.toLowerCase().includes(cari) || 
        item.periode_bulan.toLowerCase().includes(cari) || 
        item.periode_tahun.toString().includes(cari)
    );

    if(filtered.length === 0) {
        resultDiv.innerHTML = '<p style="text-align:center; color:#888;">Tidak ada data tagihan listrik.</p>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'list-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h3>${item.periode_bulan} ${item.periode_tahun}</h3>
                    <p><strong>ID:</strong> ${item.id}</p>
                    <p><strong>Pemakaian:</strong> ${item.total_pemakaian_kwh} kWh</p>
                    <p><strong>Total Biaya:</strong> Rp ${formatRupiah(item.total_biaya)}</p>
                </div>
            </div>
            <div style="font-size:11px; color:#aaa; margin-top:8px;">
                Update Terakhir: ${new Date(item.updated_at).toLocaleString('id-ID')}
            </div>
        `;
        resultDiv.appendChild(card);
    });
}

// ========================
// TAMBAH
// ========================
function tambahListrik() {
    const idInput = document.getElementById('addId').value.trim();
    const id = idInput ? idInput : generateListrikId();
    const bulan = document.getElementById('addBulan').value;
    const tahun = document.getElementById('addTahun').value.trim();
    const kwh = document.getElementById('addKwh').value.trim();
    // Parse the Rupiah string by removing dots
    let biayaStr = document.getElementById('addBiaya').value.trim();
    const biaya = biayaStr ? biayaStr.replace(/\./g, '') : '';

    if(!tahun || !kwh || !biaya) {
        alert("Semua field kecuali ID wajib diisi!");
        return;
    }

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    
    // Cek duplikasi ID
    if(data.find(i => i.id === id)) {
        alert("ID sudah digunakan, gunakan ID lain!");
        return;
    }

    const now = new Date().toISOString();

    const newItem = {
        id: id,
        periode_bulan: bulan,
        periode_tahun: parseInt(tahun),
        total_pemakaian_kwh: parseFloat(kwh),
        total_biaya: parseFloat(biaya),
        created_at: now,
        updated_at: now
    };

    data.push(newItem);
    localStorage.setItem(STORAGE_KEY_LISTRIK, JSON.stringify(data));

    alert("Berhasil menyimpan tagihan listrik!");
    
    // Clear form
    document.getElementById('addId').value = '';
    document.getElementById('addKwh').value = '';
    document.getElementById('addBiaya').value = '';

    switchTabListrik('daftar');
}

// ========================
// EDIT
// ========================
let currentEditId = null;

function cariEditListrik() {
    const search = document.getElementById('editSearchId').value.trim().toLowerCase();
    if(!search) return;

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    const found = data.find(i => 
        i.id.toLowerCase() === search || 
        i.periode_bulan.toLowerCase() === search || 
        i.periode_tahun.toString() === search
    );

    if(found) {
        currentEditId = found.id;
        document.getElementById('editBulan').value = found.periode_bulan;
        document.getElementById('editTahun').value = found.periode_tahun;
        document.getElementById('editKwh').value = found.total_pemakaian_kwh;
        // Edit biaya expects formatted string
        document.getElementById('editBiaya').value = formatRupiah(found.total_biaya);
        document.getElementById('editForm').style.display = 'block';
    } else {
        alert("Data tidak ditemukan!");
        document.getElementById('editForm').style.display = 'none';
        currentEditId = null;
    }
}

function simpanEditListrik() {
    if(!currentEditId) return;

    const kwh = document.getElementById('editKwh').value.trim();
    // Parse the Rupiah string by removing dots
    let biayaStr = document.getElementById('editBiaya').value.trim();
    const biaya = biayaStr ? biayaStr.replace(/\./g, '') : '';

    if(!kwh || !biaya) {
        alert("Total Pemakaian dan Total Biaya tidak boleh kosong!");
        return;
    }

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    const index = data.findIndex(i => i.id === currentEditId);

    if(index !== -1) {
        data[index].total_pemakaian_kwh = parseFloat(kwh);
        data[index].total_biaya = parseFloat(biaya);
        data[index].updated_at = new Date().toISOString();
        
        localStorage.setItem(STORAGE_KEY_LISTRIK, JSON.stringify(data));
        alert("Data berhasil diupdate!");
        
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('editSearchId').value = '';
        currentEditId = null;
        switchTabListrik('daftar');
    }
}

// ========================
// HAPUS
// ========================
let currentHapusId = null;

function cariHapusListrik() {
    const search = document.getElementById('hapusSearchId').value.trim().toLowerCase();
    if(!search) return;

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
    const found = data.find(i => 
        i.id.toLowerCase() === search || 
        i.periode_bulan.toLowerCase() === search || 
        i.periode_tahun.toString() === search
    );

    if(found) {
        currentHapusId = found.id;
        document.getElementById('hapusPeriodeDisplay').innerText = `Periode: ${found.periode_bulan} ${found.periode_tahun}`;
        document.getElementById('hapusIdDisplay').innerText = found.id;
        document.getElementById('hapusKwhDisplay').innerText = found.total_pemakaian_kwh;
        document.getElementById('hapusBiayaDisplay').innerText = formatRupiah(found.total_biaya);
        document.getElementById('hapusDetail').style.display = 'block';
    } else {
        alert("Data tidak ditemukan!");
        document.getElementById('hapusDetail').style.display = 'none';
        currentHapusId = null;
    }
}

function hapusListrik() {
    if(!currentHapusId) return;

    if(confirm("Yakin ingin menghapus data tagihan listrik ini permanen?")) {
        let data = JSON.parse(localStorage.getItem(STORAGE_KEY_LISTRIK));
        data = data.filter(i => i.id !== currentHapusId);
        
        localStorage.setItem(STORAGE_KEY_LISTRIK, JSON.stringify(data));
        alert("Data berhasil dihapus!");
        
        document.getElementById('hapusDetail').style.display = 'none';
        document.getElementById('hapusSearchId').value = '';
        currentHapusId = null;
        switchTabListrik('daftar');
    }
}

// Initialize on load
window.onload = () => {
    initListrikDB();
    switchTabListrik('daftar');
};
