// Gunakan URL Web App Anda yang baru
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxr5NYxcoOeSXz0lSElszWO-rJ1z1NZheOODHDkQ44g1cd4R-BBr5xXnq9ggBSd-D9V/exec'; 

let dataKaryawan = [];

// Memuat data dari Google Sheet saat halaman dibuka
window.onload = function() {
    loadSheetData();
};

function loadSheetData() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="initial-message">🔄 Memuat data dari Google Sheet...</p>';

    fetch(SHEET_URL)
        .then(response => response.json())
        .then(json => {
            if (json.data) {
                dataKaryawan = json.data;
                resultsContainer.innerHTML = `<p class="initial-message" style="color: green;">✅ Siap! ${dataKaryawan.length} data berhasil dimuat. Masukkan NIK dan tekan tombol **CARI AKUN**.</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p class="not-found">❌ Gagal memuat data. Periksa koneksi atau URL Apps Script Anda.</p>';
        });
}

function searchData() {
    const searchTerm = document.getElementById('nikInput').value.trim();
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = '';

    // Validasi 16 Digit
    if (searchTerm.length !== 16 || isNaN(searchTerm)) {
        resultsContainer.innerHTML = '<p class="not-found">Silakan masukkan 16 digit NIK/KTP ID yang valid.</p>';
        return;
    }

    if (dataKaryawan.length === 0) {
        resultsContainer.innerHTML = '<p class="not-found">Data belum selesai dimuat. Mohon tunggu sebentar.</p>';
        return;
    }

    // Mencari NIK yang sesuai
    const exactMatch = dataKaryawan.filter(item => String(item["KTP ID"]).trim() === searchTerm);

    if (exactMatch.length > 0) {
        exactMatch.forEach(item => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            let content = '<h3>✅ DATA DITEMUKAN</h3>';
            // Menampilkan semua kolom yang ada di Sheet secara otomatis
            for (const key in item) {
                if (item[key]) {
                    content += `<p><strong>${key}:</strong> ${item[key]}</p>`;
                }
            }
            resultCard.innerHTML = content;
            resultsContainer.appendChild(resultCard);
        });
    } else {
        // Pesan jika NIK tidak ditemukan
        resultsContainer.innerHTML = `<p class="not-found">NIK <b>${searchTerm}</b> tidak ditemukan dalam database.</p>`;
    }
}