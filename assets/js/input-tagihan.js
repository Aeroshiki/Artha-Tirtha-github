/* =========================
   INPUT TAGIHAN FUNCTIONS
========================= */

let inputTagihanDB = [
  { 
    id: "2001", nama: "Andi", meterLamaInt: 125, 
    riwayat: [
      { idTagihan: "T-2001-02", bulan: "Februari", tahun: "2026", meterLama: 100, meterBaru: 125, tagihan: 150000 },
      { idTagihan: "T-2001-01", bulan: "Januari", tahun: "2026", meterLama: 80, meterBaru: 100, tagihan: 120000 }
    ]
  },
  { 
    id: "2002", nama: "Budi", meterLamaInt: 245, 
    riwayat: [
      { idTagihan: "T-2002-02", bulan: "Februari", tahun: "2026", meterLama: 210, meterBaru: 245, tagihan: 210000 }
    ]
  }
];

let globalSelectedTagihanId = null;
let globalSelectedUserId = null;

function switchInputTagihanTab(tabId) {
  ['input', 'edit', 'hapus'].forEach(id => {
    document.getElementById(`tab-${id}`).classList.remove('active');
    document.getElementById(`section-${id}`).classList.remove('active');
  });
  
  document.getElementById(`tab-${tabId}`).classList.add('active');
  document.getElementById(`section-${tabId}`).classList.add('active');
  
  // Hide specific areas when switching
  document.getElementById("inputFormArea").style.display = "none";
  document.getElementById("editListArea").style.display = "none";
  document.getElementById("editFormArea").style.display = "none";
  document.getElementById("hapusListArea").style.display = "none";
  document.getElementById("hapusDetailArea").style.display = "none";
}

// 1. INPUT TAGIHAN
function cariUntukInput() {
  const query = document.getElementById("inputSearchQuery").value.trim().toLowerCase();
  const user = inputTagihanDB.find(u => u.id === query || u.nama.toLowerCase().includes(query));
  
  if (user) {
    document.getElementById("inputFormArea").style.display = "block";
    document.getElementById("inputNamaDisplay").innerText = `Pelanggan: ${user.nama} (${user.id})`;
    document.getElementById("inputMeterLamaLbl").innerText = `${user.meterLamaInt} m³`;
    globalSelectedUserId = user.id;
  } else {
    alert("Pelanggan tidak ditemukan!");
    document.getElementById("inputFormArea").style.display = "none";
  }
}

function simpanInputTagihan() {
  const mBaru = parseInt(document.getElementById("inputMeterBaru").value);
  const bulan = document.getElementById("inputBulan").value;
  const tahun = document.getElementById("inputTahun").value;
  
  if (!mBaru || !bulan || !tahun) {
    alert("Harap lengkapi Meteran Baru, Bulan, dan Tahun!");
    return;
  }
  
  const user = inputTagihanDB.find(u => u.id === globalSelectedUserId);
  if (mBaru <= user.meterLamaInt) {
    alert("Meteran Baru harus lebih besar dari Meteran Lama!");
    return;
  }
  
  const pemakaian = mBaru - user.meterLamaInt;
  const randomTagihan = pemakaian * 6000;
  
  user.riwayat.unshift({
    idTagihan: `T-${user.id}-${Math.floor(Math.random() * 1000)}`,
    bulan: bulan,
    tahun: tahun,
    meterLama: user.meterLamaInt,
    meterBaru: mBaru,
    tagihan: randomTagihan
  });
  
  user.meterLamaInt = mBaru;
  
  alert("Data Tagihan Berhasil Disimpan!");
  document.getElementById("inputMeterBaru").value = "";
  document.getElementById("inputFormArea").style.display = "none";
}

// 2. EDIT TAGIHAN
function cariUntukEdit() {
  const query = document.getElementById("editSearchQuery").value.trim().toLowerCase();
  const user = inputTagihanDB.find(u => u.id === query || u.nama.toLowerCase().includes(query));
  
  if (user && user.riwayat.length > 0) {
    globalSelectedUserId = user.id;
    document.getElementById("editListArea").style.display = "block";
    document.getElementById("editFormArea").style.display = "none";
    
    let html = "";
    user.riwayat.forEach(r => {
      html += `
        <div class="riwayat-item" onclick="pilihUntukEdit('${r.idTagihan}')">
          <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>${r.bulan} ${r.tahun}</span>
            <span style="color:#d97706;">PILIH</span>
          </div>
          <div style="font-size:13px; color:#495057; margin-top:4px;">
            Meter: ${r.meterLama} - ${r.meterBaru} m³ | Total: Rp ${r.tagihan.toLocaleString('id-ID')}
          </div>
        </div>
      `;
    });
    document.getElementById("editRiwayatList").innerHTML = html;
  } else {
    alert("Pelanggan tidak ditemukan atau belum memiliki riwayat tagihan!");
    document.getElementById("editListArea").style.display = "none";
  }
}

function pilihUntukEdit(idTagihan) {
  const user = inputTagihanDB.find(u => u.id === globalSelectedUserId);
  const tagihanObj = user.riwayat.find(r => r.idTagihan === idTagihan);
  
  if (tagihanObj) {
    globalSelectedTagihanId = idTagihan;
    document.getElementById("editFormArea").style.display = "block";
    document.getElementById("editMeterLama").value = tagihanObj.meterLama;
    document.getElementById("editMeterBaru").value = tagihanObj.meterBaru;
    document.getElementById("editTotalTagihan").value = tagihanObj.tagihan;
  }
}

function tanyaSimpanEdit() {
  const confirmEdit = confirm("Apakah Anda yakin ingin Menyimpan Data Perubahan ini?");
  if (confirmEdit) {
    const user = inputTagihanDB.find(u => u.id === globalSelectedUserId);
    const tagihanObj = user.riwayat.find(r => r.idTagihan === globalSelectedTagihanId);
    
    tagihanObj.meterLama = parseInt(document.getElementById("editMeterLama").value);
    tagihanObj.meterBaru = parseInt(document.getElementById("editMeterBaru").value);
    tagihanObj.tagihan = parseInt(document.getElementById("editTotalTagihan").value);
    
    if (user.riwayat[0].idTagihan === tagihanObj.idTagihan) {
      user.meterLamaInt = tagihanObj.meterBaru;
    }
    
    alert("Data berhasil diperbarui!");
    document.getElementById("editFormArea").style.display = "none";
    cariUntukEdit(); 
  }
}

// 3. HAPUS TAGIHAN
function cariUntukHapus() {
  const query = document.getElementById("hapusSearchQuery").value.trim().toLowerCase();
  const user = inputTagihanDB.find(u => u.id === query || u.nama.toLowerCase().includes(query));
  
  if (user && user.riwayat.length > 0) {
    globalSelectedUserId = user.id;
    document.getElementById("hapusListArea").style.display = "block";
    document.getElementById("hapusDetailArea").style.display = "none";
    
    let html = "";
    user.riwayat.forEach(r => {
      html += `
        <div class="riwayat-item" onclick="pilihUntukHapus('${r.idTagihan}')">
          <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>${r.bulan} ${r.tahun}</span>
            <span style="color:#e03131;">PILIH</span>
          </div>
          <div style="font-size:13px; color:#495057; margin-top:4px;">
            Meter: ${r.meterLama} - ${r.meterBaru} m³ | Total: Rp ${r.tagihan.toLocaleString('id-ID')}
          </div>
        </div>
      `;
    });
    document.getElementById("hapusRiwayatList").innerHTML = html;
  } else {
    alert("Pelanggan tidak ditemukan atau belum memiliki riwayat tagihan!");
    document.getElementById("hapusListArea").style.display = "none";
  }
}

function pilihUntukHapus(idTagihan) {
  const user = inputTagihanDB.find(u => u.id === globalSelectedUserId);
  const tagihanObj = user.riwayat.find(r => r.idTagihan === idTagihan);
  
  if (tagihanObj) {
    globalSelectedTagihanId = idTagihan;
    document.getElementById("hapusDetailArea").style.display = "block";
    document.getElementById("hapusPilihanDisplay").innerHTML = `
      <strong>Bulan/Tahun:</strong> ${tagihanObj.bulan} ${tagihanObj.tahun}<br>
      <strong>Pemakaian:</strong> ${tagihanObj.meterLama} m³ ➔ ${tagihanObj.meterBaru} m³<br>
      <strong>Total:</strong> Rp ${tagihanObj.tagihan.toLocaleString('id-ID')}
    `;
  }
}

function tanyaHapus() {
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data tagihan ini PERMANEN?");
  if (confirmDelete) {
    const user = inputTagihanDB.find(u => u.id === globalSelectedUserId);
    user.riwayat = user.riwayat.filter(r => r.idTagihan !== globalSelectedTagihanId);
    
    if (user.riwayat.length > 0) {
      user.meterLamaInt = user.riwayat[0].meterBaru;
    } else {
      user.meterLamaInt = 0;
    }
    
    alert("Data Tagihan Berhasil Dihapus Permanen!");
    document.getElementById("hapusDetailArea").style.display = "none";
    cariUntukHapus(); 
  }
}
