// URL JSON yang mengambil data dari Google Sheet Anda
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1-FjO_WXuYN35KMlQznzN3d_FkOrSq9NTfbLtcqrK-e8/gviz/tq?tqx=out:json&gid=0';

// Variabel untuk menyimpan data yang sudah diolah dari Sheet
let karyawanData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Panggil fungsi untuk memuat data saat halaman selesai dimuat
    loadSheetData();
});

function loadSheetData() {
    // Ambil elemen untuk pesan loading
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = '<p class="loading">Memuat data terbaru dari Google Sheet...</p>';
    }

    // Ambil data dari Google Sheet URL
    fetch(SHEET_URL)
        .then(response => response.text())
        .then(text => {
            // Data dari GSheets datang dalam format yang aneh, perlu diolah:
            // Hapus bagian "/*O_o*/..." di awal dan akhir untuk mendapatkan JSON murni
            const jsonText = text.substring(47).slice(0, -2);
            const json = JSON.parse(jsonText);
            
            // Konversi data JSON menjadi array objek yang mudah dicari
            karyawanData = transformSheetData(json.table);
            
            console.log('Data berhasil dimuat. Total karyawan:', karyawanData.length);
            
            // Hapus pesan loading dan siap menerima input
            if (resultDiv) {
                 resultDiv.innerHTML = '<p class="info">Masukkan NIK KTP ID 16 Digit untuk mencari data akun OWS/SAPN.</p>';
            }
            
            // Aktifkan kembali fungsi pencarian setelah data dimuat
            document.getElementById('searchForm').addEventListener('submit', searchKaryawan);
        })
        .catch(error => {
            console.error('Error memuat data dari Sheet:', error);
            if (resultDiv) {
                resultDiv.innerHTML = '<p class="error">❌ Gagal memuat data dari Google Sheet. Pastikan Sheet sudah di-Publish ke web.</p>';
            }
        });
}

function transformSheetData(table) {
    if (!table.cols || !table.rows) return [];
    
    // Ambil header kolom (Baris 1 di Sheet)
    const headers = table.cols.map(col => col.label);
    
    return table.rows.map(row => {
        const item = {};
        row.c.forEach((cell, index) => {
            // Ambil nilai sel. Gunakan nilai format jika ada, jika tidak, gunakan nilai biasa.
            const value = cell ? (cell.f || cell.v) : '';
            // Gunakan header sebagai kunci
            item[headers[index]] = value; 
        });
        return item;
    });
}

// --- Fungsi Pencarian (Sama seperti sebelumnya, tapi sekarang menggunakan karyawanData global) ---

function searchKaryawan(event) {
    event.preventDefault();
    const nikInput = document.getElementById('nikInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = '';

    if (nikInput.length !== 16 || isNaN(nikInput)) {
        resultDiv.innerHTML = '<p class="error">Masukkan NIK KTP ID 16 Digit yang valid.</p>';
        return;
    }

    const foundData = karyawanData.find(karyawan => karyawan["KTP ID"] === nikInput);

    if (foundData) {
        displayResult(foundData, resultDiv);
    } else {
        resultDiv.innerHTML = '<p class="not-found">NIK ' + nikInput + ' tidak ditemukan dalam database.</p>';
    }
}

function displayResult(data, container) {
    let html = '<h2>✅ Data Akun Ditemukan</h2>';
    html += '<table>';

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            // Hilangkan data yang kosong kecuali NIK ID
            if (data[key] || key === "KTP ID") { 
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