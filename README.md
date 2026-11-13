# Media Monitoring Sinar Mas

Dashboard pemantauan konten negatif terkait Sinar Mas Group di media online dan media sosial, disusun oleh Tempo Data Science.

## Isi folder

- `index.html`, `style.css`, `app.js`, `calc.js`, `dash.js`: halaman dashboard.
- `vendor/d3.min.js`: pustaka grafik D3 v7.
- `data/entries.json`: konten hari pemantauan terbaru.
- `data/riwayat.json`: konten hari-hari sebelumnya.
- `data/briefs.json`, `data/briefs_riwayat.json`: temuan dan rekomendasi analis.

## Menambah data harian

Setiap baris konten memakai kolom berikut:

| Kolom | Isi |
|---|---|
| `id` | Nomor unik |
| `lap` | Tanggal laporan (YYYY-MM-DD), yaitu hari pemantauan yang ditutup pukul 16.00 WIB |
| `tgl`, `jam` | Tanggal dan jam unggah (`jam` boleh kosong) |
| `kanal` | `Media Online` atau `Media Sosial` |
| `saluran` | `Media Online`, `Threads`, `X`, atau `Facebook` |
| `sumber`, `judul`, `link` | Nama media atau akun, judul atau ringkasan isi, tautan |
| `lini` | `Group`, `Agribusiness`, `Pulp & Paper`, `Property`, `Financial`, `Technology`, `Energy & Infrastructure` |
| `isu`, `kluster` | Isu spesifik dan kelompok isu |
| `sentimen` | `Negatif`, `Netral`, atau `Positif` |
| `views`, `likes`, `reposts`, `replies` | Angka saat data diambil (boleh `null`) |
| `status` | `Kandidat`, `Masuk alert`, atau `Dibuang` |
| `catatan` | Catatan analis |

Cara paling sederhana: pindahkan isi `data/entries.json` ke akhir `data/riwayat.json`, lalu isi `data/entries.json` dengan data hari baru. Lakukan hal yang sama untuk `briefs.json`. Setelah file di-commit, GitHub Pages memperbarui situs dalam satu sampai dua menit.

## Pratinjau lokal

Halaman memuat data dengan `fetch`, jadi tidak bisa dibuka langsung dari file. Jalankan server lokal di folder ini:

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000`.
