"use client";

import {
  BadgeCheck,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  History,
  Menu,
  MessageCircle,
  QrCode,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, STORE, VOUCHER } from "@/lib/store";

type HistoryItem = {
  uid: string;
  price: number;
  finalPrice: number;
  voucher?: string;
  time: string;
};

const PRODUCT_IMAGE =
  "https://cdn.phototourl.com/free/2026-08-26-f5d5149f-a152-45cb-9cfd-3cf599e320b9.jpg";

const STORAGE_HISTORY = "pidz_store_purchase_history_v1";
const STORAGE_SEEN = "pidz_store_seen_v1";
const STORAGE_WELCOME = "pidz_store_welcome_seen_v1";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function Verified() {
  return (
    <BadgeCheck
      className="inline-block h-4 w-4 translate-y-[2px] fill-blue-600 text-white"
      strokeWidth={2.5}
    />
  );
}

export default function Home() {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof PRODUCTS)[number] | null
  >(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const products = useMemo(() => {
    return PRODUCTS.filter(
      (product) => product.uid && product.uid.trim().length > 0
    ).sort((a, b) => b.price - a.price);
  }, []);

  const priceCategories = useMemo(() => {
    return [...new Set(products.map((product) => product.price))].sort(
      (a, b) => a - b
    );
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (selectedPrice === null) return products;
    return products.filter((product) => product.price === selectedPrice);
  }, [products, selectedPrice]);

  const voucherAvailable = useMemo(() => {
    if (!VOUCHER?.active) return false;
    if (!VOUCHER.code?.trim()) return false;

    const expiry = new Date(VOUCHER.expiresAt).getTime();

    return Number.isFinite(expiry) && Date.now() < expiry;
  }, []);

  const voucherValidForProduct = useMemo(() => {
    if (!selectedProduct || !voucherAvailable) return false;

    return (
      selectedProduct.price >= VOUCHER.minPrice &&
      selectedProduct.price <= VOUCHER.maxPrice
    );
  }, [selectedProduct, voucherAvailable]);

  const finalPrice = useMemo(() => {
    if (!selectedProduct) return 0;

    if (
      voucherApplied &&
      voucherValidForProduct &&
      voucherCode.trim().toUpperCase() === VOUCHER.code.trim().toUpperCase()
    ) {
      const discount =
        selectedProduct.price * (Number(VOUCHER.percent) / 100);

      return Math.max(0, Math.round(selectedProduct.price - discount));
    }

    return selectedProduct.price;
  }, [
    selectedProduct,
    voucherApplied,
    voucherValidForProduct,
    voucherCode,
  ]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_HISTORY);

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);

        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }

      const seen = localStorage.getItem(STORAGE_SEEN);

      if (!seen) {
        setWelcomeOpen(true);
        localStorage.setItem(STORAGE_SEEN, "1");
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  function openBuy(product: (typeof PRODUCTS)[number]) {
    setSelectedProduct(product);
    setVoucherCode("");
    setVoucherApplied(false);
    setBuyOpen(true);
  }

  function applyVoucher() {
    if (!selectedProduct) return;

    if (!voucherAvailable) {
      alert("Voucher sedang tidak tersedia.");
      return;
    }

    if (!voucherValidForProduct) {
      alert(
        `Voucher hanya berlaku untuk harga ${formatPrice(
          VOUCHER.minPrice
        )} - ${formatPrice(VOUCHER.maxPrice)}.`
      );
      return;
    }

    if (
      voucherCode.trim().toUpperCase() !==
      VOUCHER.code.trim().toUpperCase()
    ) {
      alert("Kode voucher tidak valid.");
      setVoucherApplied(false);
      return;
    }

    setVoucherApplied(true);
  }

  function buyViaWhatsApp() {
    if (!selectedProduct) return;

    const voucherText =
      voucherApplied && voucherCode
        ? `\nVoucher: ${voucherCode.toUpperCase()} (-${VOUCHER.percent}%)`
        : "";

    const message = [
      `Halo Admin PIDZ STORE ${"✓"}`,
      "",
      "Saya ingin membeli UID berikut:",
      `UID: ${selectedProduct.uid}`,
      `Harga: ${formatPrice(selectedProduct.price)}`,
      `Total: ${formatPrice(finalPrice)}`,
      voucherText,
      "",
      "Mohon diproses.",
    ].join("\n");

    const newHistory: HistoryItem = {
      uid: selectedProduct.uid,
      price: selectedProduct.price,
      finalPrice,
      voucher:
        voucherApplied && voucherCode
          ? voucherCode.toUpperCase()
          : undefined,
      time: new Date().toISOString(),
    };

    const updatedHistory = [newHistory, ...history];

    setHistory(updatedHistory);

    try {
      localStorage.setItem(
        STORAGE_HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch {
      // Ignore localStorage errors.
    }

    const whatsappUrl = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setBuyOpen(false);
  }

  function openChannel() {
    window.open(STORE.channel, "_blank", "noopener,noreferrer");
    setJoinOpen(false);
  }

  function openGroup() {
    window.open(STORE.group, "_blank", "noopener,noreferrer");
    setJoinOpen(false);
  }

  async function copyUid(uid: string) {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      alert("UID: " + uid);
    }
  }

  function closeWelcome() {
    setWelcomeOpen(false);

    try {
      const joined = localStorage.getItem(STORAGE_WELCOME);

      if (!joined) {
        setTimeout(() => {
          setJoinOpen(true);
        }, 250);
      }

      localStorage.setItem(STORAGE_WELCOME, "1");
    } catch {
      // Ignore localStorage errors.
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
          >
            <div className="h-11 w-11 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md">
              <img
                src={STORE.logo}
                alt="PIDZ STORE"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight text-slate-900">
                PIDZ STORE <Verified />
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                UID Cantik • Aman • Cepat
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
            >
              <History className="h-4 w-4" />
              Riwayat
            </button>

            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4" />
              Komunitas
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 sm:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setHistoryOpen(true);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold"
              >
                <History className="h-4 w-4" />
                Riwayat
              </button>

              <button
                onClick={() => {
                  setJoinOpen(true);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Komunitas
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-5 sm:px-6">
        <div className="group relative overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-blue-100/60">
          <img
            src={STORE.banner}
            alt="PIDZ STORE Banner"
            className="aspect-video w-full object-cover transition duration-700 group-hover:scale-[1.015]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="max-w-xl">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                UID CANTIK PREMIUM
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white drop-shadow sm:text-4xl">
                PIDZ STORE <Verified />
              </h1>

              <p className="mt-1 max-w-md text-sm text-white/85 sm:text-base">
                Temukan UID cantik pilihan dengan proses pembelian cepat
                langsung melalui WhatsApp admin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {/* Title */}
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-600">
              <ShoppingBag className="h-4 w-4" />
              KATALOG UID
            </div>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              UID Cantik <Verified />
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Harga termurah hingga termahal tersedia di filter.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm sm:block">
            {products.length} UID tersedia
          </div>
        </div>

        {/* Price filter */}
        {priceCategories.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              <button
                onClick={() => setSelectedPrice(null)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedPrice === null
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Semua
              </button>

              {priceCategories.map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPrice(price)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedPrice === price
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {formatPrice(price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="font-black text-slate-700">
              Belum ada UID tersedia
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Tambahkan UID pada file lib/store.ts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {visibleProducts.map((product, index) => (
              <article
                key={`${product.uid}-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-white bg-white shadow-lg shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 sm:rounded-3xl"
              >
                {/* shine */}
                <div className="pointer-events-none absolute -inset-x-20 top-0 h-20 -rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100" />

                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={PRODUCT_IMAGE}
                    alt={`UID ${product.uid}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-2 top-2 rounded-full border border-white/30 bg-black/45 px-2 py-1 text-[9px] font-black text-white backdrop-blur-md sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
                    UID CANTIK
                  </div>

                  {product.sold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                      <span className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg">
                        SOLD
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                    UID
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="min-w-0 flex-1 truncate text-sm font-black text-slate-800 sm:text-lg">
                      {product.uid}
                    </div>

                    <button
                      onClick={() => copyUid(product.uid)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Copy UID"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-black text-blue-600 sm:text-xl">
                        {formatPrice(product.price)}
                      </div>

                      {voucherAvailable &&
                        product.price >= VOUCHER.minPrice &&
                        product.price <= VOUCHER.maxPrice && (
                          <div className="mt-0.5 flex items-center gap-1 text-[9px] font-bold text-green-600 sm:text-[10px]">
                            <Tag className="h-3 w-3" />
                            Bisa pakai voucher
                          </div>
                        )}
                    </div>

                    <button
                      disabled={product.sold}
                      onClick={() => openBuy(product)}
                      className={`rounded-xl px-3 py-2.5 text-xs font-black transition sm:px-4 ${
                        product.sold
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700"
                      }`}
                    >
                      {product.sold ? "SOLD" : "Beli Sekarang"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
          <div className="font-black">
            PIDZ STORE <Verified />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            UID Cantik • Aman • Cepat
          </p>
        </div>
      </footer>

      {/* Welcome Modal */}
      {welcomeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md">
          <div className="animate-[modalIn_.35s_ease-out] w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pb-8 pt-10 text-center text-white">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-3xl border-4 border-white/30 bg-white shadow-xl">
                <img
                  src={STORE.logo}
                  alt="PIDZ STORE"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="text-2xl font-black">
                Selamat Datang
              </div>

              <div className="mt-1 text-sm text-blue-100">
                Diwebsite PIDZ STORE <Verified />
              </div>

              <Sparkles className="absolute right-5 top-5 h-5 w-5 text-white/60" />
            </div>

            <div className="p-6">
              <p className="text-center text-sm leading-6 text-slate-500">
                Nikmati koleksi UID cantik pilihan PIDZ STORE. Sebelum
                membeli, kamu bisa bergabung ke komunitas kami untuk
                mendapatkan info terbaru.
              </p>

              <button
                onClick={closeWelcome}
                className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Masuk ke Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Modal */}
      {joinOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
          <div className="animate-[modalIn_.3s_ease-out] w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-black">KOMUNITAS</span>
                </div>

                <h3 className="mt-1 text-xl font-black">
                  Gabung Komunitas PIDZ
                </h3>
              </div>

              <button
                onClick={() => setJoinOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={openChannel}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black">
                    SALURAN BAGI2 UID CANTIK DAN TESTIMONI
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Channel WhatsApp
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={openGroup}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black">
                    GRUP TERBUKA PIDZ UID CANTIK
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Grup WhatsApp
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyOpen && selectedProduct && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-md">
          <div className="animate-[modalIn_.3s_ease-out] my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative">
              <img
                src={STORE.qris}
                alt="QRIS PIDZ STORE"
                className="mx-auto h-52 w-full object-contain bg-white p-5"
              />

              <button
                onClick={() => setBuyOpen(false)}
                className="absolute right-4 top-4 rounded-xl bg-black/50 p-2 text-white backdrop-blur-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-slate-100 p-6">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-black">
                  Detail Pembelian
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-400">
                  UID
                </div>

                <div className="mt-1 break-all text-lg font-black">
                  {selectedProduct.uid}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Harga
                  </span>

                  <span className="font-black text-blue-600">
                    {formatPrice(selectedProduct.price)}
                  </span>
                </div>

                {voucherApplied && (
                  <>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Diskon
                      </span>

                      <span className="font-bold text-green-600">
                        -{VOUCHER.percent}%
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          Total
                        </span>

                        <span className="text-lg font-black text-blue-600">
                          {formatPrice(finalPrice)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {voucherAvailable &&
                selectedProduct.price >= VOUCHER.minPrice &&
                selectedProduct.price <= VOUCHER.maxPrice && (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
                      Voucher
                    </label>

                    <div className="flex gap-2">
                      <input
                        value={voucherCode}
                        onChange={(e) =>
                          setVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="Masukkan kode voucher"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none transition focus:border-blue-500 focus:bg-white"
                      />

                      <button
                        onClick={applyVoucher}
                        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-600"
                      >
                        Pakai
                      </button>
                    </div>

                    {voucherApplied && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
                        <Check className="h-3.5 w-3.5" />
                        Voucher berhasil digunakan.
                      </div>
                    )}
                  </div>
                )}

              <button
                onClick={buyViaWhatsApp}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <MessageCircle className="h-5 w-5" />
                Lanjut Beli via WhatsApp
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Setelah klik tombol, detail pesanan akan dikirim ke
                WhatsApp admin PIDZ STORE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
          <div className="animate-[modalIn_.3s_ease-out] max-h-[80vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2 text-blue-600">
                  <History className="h-5 w-5" />
                  <span className="text-xs font-black uppercase">
                    Riwayat
                  </span>
                </div>

                <h3 className="mt-1 text-xl font-black">
                  Riwayat Pembelian
                </h3>
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                  <div className="font-black text-slate-600">
                    Belum ada riwayat
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Riwayat pembelian dari perangkat ini akan muncul
                    di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={`${item.uid}-${item.time}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase text-slate-400">
                            UID
                          </div>

                          <div className="mt-1 truncate font-black">
                            {item.uid}
                          </div>
                        </div>

                        <div className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black text-blue-600">
                          PEMBELIAN
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Total
                        </span>

                        <span className="font-black text-blue-600">
                          {formatPrice(item.finalPrice)}
                        </span>
                      </div>

                      {item.voucher && (
                        <div className="mt-1 text-xs font-bold text-green-600">
                          Voucher: {item.voucher}
                        </div>
                      )}

                      <div className="mt-2 text-[10px] text-slate-400">
                        {new Date(item.time).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
            }
