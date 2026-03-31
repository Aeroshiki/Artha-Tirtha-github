/* =========================
   COMMON FUNCTIONS
========================= */

// Navigasi Kembali
function goBack() {
  window.history.back();
}

// Format Currency
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

// Format input text for Rupiah (saat diketik)
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
