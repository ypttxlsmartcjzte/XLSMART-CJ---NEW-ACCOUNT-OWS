// 1. URL Apps Script Anda (Sudah benar)
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxr5NYxcoOeSXz0lSElszWO-rJ1z1NZheOODHDkQ44g1cd4R-BBr5xXnq9ggBSd-D9V/exec'; 

let dataKaryawan = [];

// 2. Fungsi untuk mengambil data otomatis saat web dibuka
window.onload = function() {
    loadSheetData();
};

function loadSheetData() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="initial-message">🔄 Sedang menghubungkan ke database...</p>';

    fetch(SHEET_URL)
        .then(response => response.json())
        .then(json => {
            if (json.data) {
                dataKaryawan = json.data;
                resultsContainer.innerHTML = `<p class="initial-message" style="color: green;">✅ Koneksi Berhasil! ${dataKaryawan.length} data siap dicari.</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p class="not-found">❌ Gagal mengambil data. Pastikan setting "Anyone" di Google Script sudah benar.</p>';
        });
}

// 3. Fungsi Pencarian (Dipicu oleh tombol "CARI AKUN")
function searchData() {
    const searchTerm = document.getElementById('nikInput').value.trim();
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = '';

    // Validasi input 16 digit
    if (searchTerm.length !== 16 || isNaN(searchTerm)) {
        resultsContainer.innerHTML = '<p class="not-found">❌ Masukkan 16 digit NIK yang valid!</p>';
        return;
    }

    if (dataKaryawan.length === 0) {
        resultsContainer.innerHTML = '<p class="not-found">Database belum siap. Tunggu sampai muncul pesan "Koneksi Berhasil".</p>';
        return;
    }

    // Mencari NIK di data yang ditarik dari Google Sheet
    // Pastikan nama kolom di Google Sheet Anda adalah "KTP ID"
    const exactMatch = dataKaryawan.filter(item => String(item["KTP ID"]).trim() === searchTerm);

    if (exactMatch.length > 0) {
        exactMatch.forEach(item => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            let content = '<h3>✅ DATA DITEMUKAN</h3>';
            // Loop ini akan menampilkan SEMUA kolom yang ada di Google Sheet Anda
            for (const key in item) {
                if (item[key]) {
                    content += `<p><strong>${key}:</strong> ${item[key]}</p>`;
                }
            }
            resultCard.innerHTML = content;
            resultsContainer.appendChild(resultCard);
        });
    } else {
        resultsContainer.innerHTML = `<p class="not-found">❌ NIK <b>${searchTerm}</b> tidak terdaftar di database.</p>`;
    }
}