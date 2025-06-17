# Aplikasi Tes Buta Warna (Eyedra SMK)

## Deskripsi

Aplikasi web untuk melakukan tes buta warna di sekolah kejuruan (SMK) menggunakan metode Ishihara. Aplikasi ini memiliki sistem role untuk admin dan guru, memungkinkan mereka melakukan tes penglihatan warna standar untuk siswa dan membuat laporan lengkap.

## Fitur Utama

- **Sistem Login**: Role-based access untuk admin dan guru
- **Tes Ishihara**: Tes buta warna interaktif dengan soal acak
- **Manajemen Siswa**: Input data siswa dan riwayat tes
- **Laporan PDF**: Generate laporan hasil tes profesional
- **Dashboard**: Monitor statistik dan hasil tes

## Teknologi yang Digunakan

### Frontend
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack Query

### Backend
- Node.js + Express
- PostgreSQL (Neon Database)
- Drizzle ORM
- PDFKit untuk laporan

## Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/btn-acc/color.git
cd color
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database (Neon)

#### Cara Setup Neon Database:
1. Kunjungi [neon.tech](https://neon.tech) dan buat akun
2. Buat project baru
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Tunggu database selesai dibuat
5. Copy connection string dari dashboard

#### Format Connection String:
```
postgresql://username:password@host/database?sslmode=require
```

### 4. Setup Environment Variables
Buat file `.env` di root folder:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### 5. Push Database Schema
```bash
npm run db:push
```

### 6. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di:
`http://localhost:5000`

## Struktur Project

```
color/
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Schema bersama
├── .env            # Environment variables
└── package.json    # Dependencies
```

## Cara Penggunaan

1. **Login**: Gunakan akun admin atau guru
2. **Tambah Siswa**: Input data siswa baru
3. **Mulai Tes**: Pilih siswa dan mulai tes Ishihara
4. **Lihat Hasil**: Otomatis generate diagnosis dan skor
5. **Download Laporan**: Unduh laporan PDF hasil tes

## Kontribusi

Dibuat untuk mendukung tes kesehatan mata di lingkungan SMK dengan standar medis yang tepat.
