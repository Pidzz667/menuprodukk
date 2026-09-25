export type Product = { uid: string; price: number; sold: boolean };
export type Voucher = {
  code: string;
  percent: number;
  minPrice: number;
  maxPrice: number;
  expiresAt: string;
  active: boolean;
};

/*
  ==========================================
  EDIT UID DI BAGIAN INI
  ==========================================
  Format persis seperti yang diminta:
  { uid: "", price: 0, sold: false },

  Contoh:
  { uid: "123456789", price: 20000, sold: false },
*/
export const PRODUCTS: Product[] = [
  { uid: "", price: 2000, sold: false },
  { uid: "", price: 12000, sold: false },
  { uid: "", price: 20000, sold: false },
  { uid: "", price: 35000, sold: false },
  { uid: "", price: 50000, sold: false },
  { uid: "", price: 75000, sold: false },
  { uid: "", price: 100000, sold: false }
];

/*
  ==========================================
  VOUCHER
  ==========================================
  Kalau active=false atau code kosong, tombol/menu voucher
  otomatis TIDAK muncul di website.

  Diskon hanya diterima untuk harga 12.000 - 100.000.
  expiresAt adalah waktu kadaluarsa promo.
*/
export const VOUCHER: Voucher = {
  code: "",
  percent: 10,
  minPrice: 12000,
  maxPrice: 100000,
  expiresAt: "2026-10-01T23:59:59+07:00",
  active: false
};

export const STORE = {
  name: "PIDZ STORE",
  whatsapp: "6285141631493",
  qris: "https://cdn.phototourl.com/free/2026-08-24-d32b4785-cf17-4b66-ad24-8a358b173d4e.jpg",
  productImage: "https://cdn.phototourl.com/free/2026-08-26-f5d5149f-a152-45cb-9cfd-3cf599e320b9.jpg",
  banner: "https://cdn.phototourl.com/free/2026-08-26-f62b4b8b-1223-47e1-8c09-82db1aa08b38.jpg",
  logo: "https://cdn.phototourl.com/free/2026-08-26-ca2b2e6f-1bbf-46c7-8c9f-bcce1e97ab4c.jpg",
  channel: "https://whatsapp.com/channel/0029Vb8WZbAH5JLwJzymm90G",
  group: "https://chat.whatsapp.com/K6KAC9R46ZoElU5IKp54i4"
};

export function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(value);
}

export function cleanProducts() {
  return PRODUCTS.filter((p) => p.uid.trim());
}

export function voucherAvailable() {
  return Boolean(
    VOUCHER.active &&
    VOUCHER.code.trim() &&
    VOUCHER.expiresAt &&
    new Date(VOUCHER.expiresAt).getTime() > Date.now()
  );
}

export function applyVoucher(price: number, code: string) {
  if (!voucherAvailable()) return { valid: false, price, discount: 0 };
  if (code.trim().toUpperCase() !== VOUCHER.code.trim().toUpperCase()) {
    return { valid: false, price, discount: 0 };
  }
  if (price < VOUCHER.minPrice || price > VOUCHER.maxPrice) {
    return { valid: false, price, discount: 0 };
  }
  const discount = Math.floor(price * (VOUCHER.percent / 100));
  return { valid: true, price: price - discount, discount };
}
