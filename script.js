// **PASTIKAN URL INI BENAR:** URL Web App Anda yang sudah terkonfirmasi.
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxmzrV2DDkF2CUZT4L9fxcK6YF4qoYV3dC0tUMC3ygecSPRQQWR1qGCUZV5z9YgjZFB/exec'; 

let karyawanData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Pasang listener pada form (sebelum data dimuat) agar bisa menunjukkan status loading
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    loadSheetData();
});

// Fungsi penanganan pencarian utama (Dipanggil saat tombol Cari ditekan)
function handleSearch(event) {
    event.preventDefault();
    
    // Jika data belum dimuat, jangan izinkan pencarian
    if (karyawanData.length === 0) {
         document.getElementById('result').innerHTML = '<p class="error">Data belum selesai dimuat. Silakan coba lagi sebentar.</p>';
         return;
    }
    
    // Lakukan pencarian hanya jika data sudah ada
    searchKaryawan();
}

function loadSheetData() {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = '<p class="loading">Memuat data terbaru dari Google Sheet...</p>';
    }

    fetch(SHEET_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengambil data dari Apps Script. Cek status deployment.');
            }
            return response.json();
        })
        .then(json => {
            // Data sudah bersih dari Web App, langsung ambil array 'data'
            karyawanData = json.data || [];
            
            console.log('Data berhasil dimuat. Total karyawan:', karyawanData.length);
            
            if (resultDiv) {
                 resultDiv.innerHTML = `<p class="info">Data ${karyawanData.length} NIK Karyawan Siap Dicari. Masukkan NIK KTP ID 16 Digit.</p>`;
            }
        })
        .catch(error => {
            console.error('Error memuat data:', error);
            if (resultDiv) {
                resultDiv.innerHTML = `<p class="error">❌ Gagal memuat data dari Google Sheet. Error: ${error.message}. Pastikan Web App di-Deploy sebagai 'Execute as: Me' dan 'Who has access: Anyone'.</p>`;
            }
        });
}


function searchKaryawan() {
    const nikInput = document.getElementById('nikInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    // **SANGAT PENTING: Kosongkan hasil sebelumnya**
    resultDiv.innerHTML = ''; 

    // 1. Validasi Input
    if (nikInput.length !== 16 || isNaN(nikInput)) {
        console.warn('NIK tidak valid.');
        resultDiv.innerHTML = '<p class="error">Masukkan NIK KTP ID 16 Digit yang valid (hanya angka).</p>';
        return; 
    }

    // 2. Cari Data
    // Gunakan find() untuk mencari NIK
    const foundData = karyawanData.find(karyawan => karyawan["KTP ID"] === nikInput);
    
    console.log('Mencari NIK:', nikInput, ' | Hasil Pencarian:', foundData ? 'Ditemukan' : 'Tidak Ditemukan');

    // 3. Tampilkan Hasil
    if (foundData) {
        displayResult(foundData, resultDiv);
    } else {
        // **JALUR DATA TIDAK DITEMUKAN - HARUS MUNCUL PESAN INI**
        resultDiv.innerHTML = '<p class="not-found">NIK ' + nikInput + ' tidak ditemukan dalam database.</p>';
    }
}

function displayResult(data, container) {
    let html = '<h2>✅ Data Akun Ditemukan</h2>';
    html += '<table>';

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key]) { 
                html += '<tr>';
                html += '<th>' + key + '</th>';
                html += '<td>' + data[key] + '</td>';
                html += '</tr>';
            }
        }
    }
    
    html += '</table>';
    container.innerHTML = html;
}