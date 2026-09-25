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
  const [selectedProduct
