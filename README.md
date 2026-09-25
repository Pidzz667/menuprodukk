# PIDZ STORE

Website Next.js + React untuk store UID cantik.

## Edit UID
Buka `lib/store.ts`, lalu isi:
```ts
{ uid: "123456789", price: 20000, sold: false },
```

- List otomatis tampil dari harga paling mahal ke paling murah.
- Filter kategori harga otomatis dibuat dari harga UID yang benar-benar diisi.
- Harga yang belum punya UID tidak ditampilkan.
- Grid 2 kolom di mobile dan desktop.

## Voucher
Di `lib/store.ts`:
```ts
export const VOUCHER = {
  code: "PIDZ10",
  percent: 10,
  minPrice: 12000,
  maxPrice: 100000,
  expiresAt: "2026-10-01T23:59:59+07:00",
  active: true
};
```
Kalau `active: false` atau `code: ""`, fitur voucher otomatis tersembunyi.
Diskon otomatis hanya bisa dipakai untuk nominal Rp12.000 sampai Rp100.000.

## Telegram
Token bot sengaja TIDAK ditaruh di source/frontend.
Kalau ingin notifikasi Telegram aktif di Vercel, buat Environment Variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Website tetap berfungsi tanpa dua variable tersebut.

Notifikasi dirancang sekali per browser:
- first_visit: sekali saat browser pertama kali membuka store
- channel_click: sekali saat browser pertama kali klik channel
- buy_click: setiap klik Beli Sekarang

Riwayat pembelian tersimpan di localStorage browser dan tetap ada setelah user keluar/reload website.

## Deploy Vercel
1. Upload folder ini ke GitHub.
2. Import repository di Vercel.
3. Framework: Next.js (otomatis terdeteksi).
4. Build command: `next build`.
5. Tambahkan ENV Telegram jika memang ingin notifikasi.
6. Deploy.

Catatan: riwayat pembelian bersifat lokal di perangkat/browser. Untuk riwayat terpusat lintas perangkat diperlukan database/backend.
