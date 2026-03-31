/* =========================
   TAGIHAN / BAYAR PDAM
========================= */

let bayarTagihanDB = {
  "2001": { nama: "Andi Saputra", bulan: "April 2026", meterLama: 82, meterBaru: 110, meter: 28, saldo: 25000 },
  "2002": { nama: "Budi Setiawan", bulan: "April 2026", meterLama: 210, meterBaru: 245, meter: 35, saldo: 0 },
  "2003": { nama: "Sari", bulan: "April 2026", meterLama: 100, meterBaru: 125, meter: 25, saldo: 10000 }
};

const TARIF_PER_METER = 3500;
let currentTransaksi = null;

function cariInvoice() {
  const id = document.getElementById("userId").value.trim();
  const result = document.getElementById("invoiceResult");

  if (bayarTagihanDB[id]) {
    const data = bayarTagihanDB[id];
    const subtotal = data.meter * TARIF_PER_METER;
    const potonganSaldo = Math.min(data.saldo, subtotal);
    const totalTagihan = subtotal - potonganSaldo;

    currentTransaksi = { id, data, subtotal, potonganSaldo, totalTagihan };

    result.innerHTML = `
      <div class="invoice-card" style="text-align: left;">
        <h3 style="margin-bottom: 12px; color: #111827; font-size: 16px;">Sesi Transaksi - Pelanggan</h3>
        <p><strong>Nama:</strong> ${data.nama}</p>
        <p><strong>Periode:</strong> ${data.bulan}</p>
        <p><strong>Pemakaian:</strong> ${data.meter} m³ (${data.meterLama} - ${data.meterBaru} m³)</p>
        
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 12px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Subtotal Air:</span> <strong>Rp ${subtotal.toLocaleString('id-ID')}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #d97706;"><span>Potongan (Sisa Saldo):</span> <strong>- Rp ${potonganSaldo.toLocaleString('id-ID')}</strong></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
          <span>Total Harus Dibayar:</span> <span style="color: #e03131;">Rp ${totalTagihan.toLocaleString('id-ID')}</span>
        </div>

        <div style="margin-top: 16px; background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
          <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 6px;">Uang Dibayar (Rp)</label>
          <input type="text" id="uangDibayar" class="select-input" placeholder="Masukkan Nominal Uang" onkeyup="formatRupiahInput(this); hitungKembalian()" style="width: 100%; border: 1px solid #ddd; padding: 10px; border-radius: 8px; outline: none;">
          
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; font-size: 14px;">
            <span>Kembalian:</span> <span id="kembalianText" style="color:#0ca678;">Rp 0</span>
          </div>
          
          <div style="margin-top: 12px; font-size: 13px; display: flex; align-items: flex-start; gap: 8px;">
            <input type="checkbox" id="simpanSaldoCheck" checked style="width: 16px; height: 16px; margin-top: 2px; cursor: pointer;">
            <label for="simpanSaldoCheck" style="cursor: pointer; line-height: 1.4; color: #495057;">Jadikan kembalian sebagai Saldo tambahan untuk bulan depan</label>
          </div>
        </div>

        <button class="cek-btn" onclick="prosesPembayaran()" style="margin-top: 16px; width: 100%; background: #2d8cf0;">BAYAR & TERBITKAN STRUK</button>
      </div>
    `;
  } else {
    result.innerHTML = `
      <div class="invoice-card" style="background:#fff8f8; border-color:#ffd0d0;">
        <h3 style="color:#d62828;">Data tidak ditemukan</h3>
        <p>ID pelanggan tidak terdaftar.</p>
      </div>
    `;
  }
}

function hitungKembalian() {
  if (!currentTransaksi) return;
  const uangInput = document.getElementById("uangDibayar").value.replace(/\./g, '');
  const dibayar = parseInt(uangInput) || 0;
  const kembali = dibayar - currentTransaksi.totalTagihan;
  
  const textElem = document.getElementById("kembalianText");
  if (kembali >= 0) {
    textElem.innerText = `Rp ${kembali.toLocaleString('id-ID')}`;
    textElem.style.color = "#0ca678";
  } else {
    textElem.innerText = `- Kurang Bayar`;
    textElem.style.color = "#e03131";
  }
}

function prosesPembayaran() {
  if (!currentTransaksi) return;
  
  const uangInput = document.getElementById("uangDibayar").value.replace(/\./g, '');
  const dibayar = parseInt(uangInput) || 0;
  const kembali = dibayar - currentTransaksi.totalTagihan;
  
  if (kembali < 0) {
    alert("Maaf, uang dibayar kurang dari total tagihan!");
    return;
  }

  const { id, data, subtotal, potonganSaldo, totalTagihan } = currentTransaksi;
  const isSimpanSaldo = document.getElementById("simpanSaldoCheck").checked;
  
  // Saldo lama yang belum terpotong
  const sisaSaldoLama = data.saldo - potonganSaldo; 
  
  // Proses simpan Kembalian
  const tambahanSaldoBaru = isSimpanSaldo ? kembali : 0;
  
  // Update DB 
  bayarTagihanDB[id].saldo = sisaSaldoLama + tambahanSaldoBaru;
  
  const randomInv = `INV-202604-${Math.floor(Math.random()*9000)+1000}`;
  
  const now = new Date();
  const tglCetak = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const result = document.getElementById("invoiceResult");
  result.innerHTML = `
    <div style="display: flex; justify-content: center; width: 100%;">
      <div id="printArea" class="print-area" style="font-family: 'Courier New', Courier, monospace; color: #000; font-size: 12px; width: 100%; max-width: 58mm; margin: 0 auto; background: #fff; padding: 10px; border: 1px solid #ddd; line-height: 1.3;">
        
        <div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 2px;">ARTHA TIRTA SEJAHTERA</div>
        <div style="text-align: center; font-weight: bold; font-size: 13px; margin-bottom: 6px;">KABUPATEN GROBOGAN</div>
        
        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="display: flex;">
          <span style="width: 100px;">Tanggal Cetak</span>
          <span>: ${tglCetak}</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Operator</span>
          <span>: Admin</span>
        </div>
        
        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="display: flex;">
          <span style="width: 100px;">ID Pelanggan</span>
          <span>: ${id}</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Nama</span>
          <span>: ${data.nama}</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Periode</span>
          <span>: ${data.bulan}</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Tarif/m³</span>
          <span>: Rp 3.500</span>
        </div>

        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="display: flex;">
          <span style="width: 100px;">Meter Lama</span>
          <span>: ${data.meterLama} m³</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Meter Baru</span>
          <span>: ${data.meterBaru} m³</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Pemakaian</span>
          <span>: ${data.meter} m³</span>
        </div>

        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="display: flex;">
          <span style="width: 100px;">Subtotal Air</span>
          <span>: Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: flex;">
          <span style="width: 100px;">Sisa Saldo</span>
          <span>: Rp ${potonganSaldo.toLocaleString('id-ID')}</span>
        </div>

        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="display: flex; font-weight: bold;">
          <span style="width: 100px;">Total Tagihan</span>
          <span>: Rp ${totalTagihan.toLocaleString('id-ID')}</span>
        </div>

        <hr style="border:none; border-top:1px dashed #000; margin: 6px 0;">
        
        <div style="text-align: center; margin-top: 8px;">
          <div>Terima kasih telah menggunakan</div>
          <div>layanan Layanan Kami</div>
        </div>
      </div>
    </div>
    
    <div style="display: flex; gap: 10px; margin-top: 16px;">
      <button class="cek-btn btn-print" onclick="printInvoice()" style="flex: 1; margin-top: 0; background: #0ca678; box-shadow: 0 8px 18px rgba(12, 166, 120, 0.22);"><img src="assets/icons/Document.png" style="width:16px; vertical-align:middle; filter:brightness(0) invert(1); margin-right:6px;"> Cetak Struk</button>
      <button class="cek-btn" onclick="downloadStrukPDF()" style="flex: 1; margin-top: 0; background: #e03131; box-shadow: 0 8px 18px rgba(224, 49, 49, 0.22);">Download Struk PDF</button>
    </div>
  `;
}

function printInvoice() {
  window.print();
}

function downloadStrukPDF() {
  const element = document.getElementById("printArea");
  const id = document.getElementById("userId").value.trim();
  const opt = {
    margin:       10,
    filename:     `Struk_Tagihan_${id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
}

function switchTab(tab) {
  const tabTagihan = document.getElementById("tab-tagihan");
  const tabRiwayat = document.getElementById("tab-riwayat");
  const btnTagihan = document.getElementById("btn-tagihan");
  const btnRiwayat = document.getElementById("btn-riwayat");
  const result = document.getElementById("invoiceResult");

  // Reset result
  result.innerHTML = '';

  if (tab === 'tagihan') {
    tabTagihan.classList.add("active");
    tabRiwayat.classList.remove("active");
    btnTagihan.style.display = "block";
    btnRiwayat.style.display = "none";
  } else {
    tabRiwayat.classList.add("active");
    tabTagihan.classList.remove("active");
    btnTagihan.style.display = "none";
    btnRiwayat.style.display = "block";
  }
}

function cariRiwayat() {
  const id = document.getElementById("userId").value.trim();
  const result = document.getElementById("invoiceResult");

  const historyDatabase = {
    "2001": [
      { bulan: "Januari 2026", pemakaian: 24, tagihan: 145000, status: "Lunas" },
      { bulan: "Desember 2025", pemakaian: 22, tagihan: 135000, status: "Lunas" },
      { bulan: "November 2025", pemakaian: 26, tagihan: 155000, status: "Lunas" }
    ],
    "2002": [
      { bulan: "Januari 2026", pemakaian: 30, tagihan: 180000, status: "Lunas" },
      { bulan: "Desember 2025", pemakaian: 32, tagihan: 195000, status: "Lunas" }
    ],
    "2003": [
      { bulan: "Januari 2026", pemakaian: 20, tagihan: 120000, status: "Lunas" }
    ]
  };

  if (historyDatabase[id]) {
    let historyHTML = `<h3 style="margin-bottom: 12px; color: #111827; font-size: 16px;">Riwayat Tagihan: ${id}</h3>`;
    historyHTML += `<div class="riwayat-list">`;
    historyDatabase[id].forEach(item => {
      historyHTML += `
        <div class="riwayat-card">
          <div class="riwayat-header">
            <span class="riwayat-bulan">${item.bulan}</span>
            <span class="riwayat-status ${item.status === 'Lunas' ? 'status-lunas' : 'status-belum'}">${item.status}</span>
          </div>
          <div class="riwayat-body">
            <p>Pemakaian: <strong>${item.pemakaian} m³</strong></p>
            <p class="riwayat-total">Rp ${item.tagihan.toLocaleString('id-ID')}</p>
          </div>
        </div>
      `;
    });
    historyHTML += `</div>`;
    result.innerHTML = historyHTML;
  } else {
    result.innerHTML = `
      <div class="invoice-card" style="background:#fff8f8; border-color:#ffd0d0;">
        <h3 style="color:#d62828;">Data tidak ditemukan</h3>
        <p>Riwayat untuk ID pelanggan tersebut tidak tersedia.</p>
      </div>
    `;
  }
}
