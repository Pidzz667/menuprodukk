"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck, Check, ChevronDown, Clock3, Copy, History, MessageCircle,
  QrCode, Search, ShoppingBag, Sparkles, Tag, X, Zap
} from "lucide-react";
import { PRODUCTS, STORE, VOUCHER, applyVoucher, cleanProducts, rupiah, voucherAvailable } from "@/lib/store";

type Purchase = {
  id:string; uid:string; originalPrice:number; paidPrice:number;
  voucher?:string; time:string;
};

const HIST="pidz_store_purchase_history_v1";
const SEEN="pidz_store_seen_v1";
const CHANNEL="pidz_store_channel_notified_v1";
const WELCOME="pidz_store_welcome_seen_v1";

function notify(type:string, product="-", price="-") {
  fetch("/api/notify", {
    method:"POST", headers:{"content-type":"application/json"},
    body:JSON.stringify({type,product,price})
  }).catch(()=>{});
}

function Verified(){return <BadgeCheck className="inline-block ml-1 h-4 w-4 fill-[#1769ff] text-white align-[-3px]"/>}

export default function Home(){
  const products=useMemo(()=>cleanProducts().sort((a,b)=>b.price-a.price),[]);
  const categories=useMemo(()=>[...new Set(products.map(p=>p.price))].sort((a,b)=>a-b),[products]);
  const [welcome,setWelcome]=useState(false);
  const [joinOpen,setJoinOpen]=useState(false);
  const [selectedPrice,setSelectedPrice]=useState<number|null>(null);
  const [search,setSearch]=useState("");
  const [buying,setBuying]=useState<(typeof products)[number]|null>(null);
  const [voucher,setVoucher]=useState("");
  const [voucherResult,setVoucherResult]=useState<{valid:boolean;price:number;discount:number}|null>(null);
  const [history,setHistory]=useState<Purchase[]>([]);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [copied,setCopied]=useState("");
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(HIST);
      if(saved)setHistory(JSON.parse(saved));
      if(!localStorage.getItem(WELCOME)){
        setWelcome(true); localStorage.setItem(WELCOME,"1");
      }
      if(!localStorage.getItem(SEEN)){
        localStorage.setItem(SEEN,"1"); notify("first_visit");
      }
    }catch{}
  },[]);

  function channel(){
    if(!localStorage.getItem(CHANNEL)){
      localStorage.setItem(CHANNEL,"1"); notify("channel_click");
    }
    window.open(STORE.channel,"_blank","noopener,noreferrer");
  }

  function startBuy(p:(typeof products)[number]){
    setBuying(p); setVoucher(""); setVoucherResult(null);
    notify("buy_click",p.uid,rupiah(p.price));
  }

  function checkVoucher(){
    if(!buying)return;
    setVoucherResult(applyVoucher(buying.price,voucher));
  }

  function confirmBuy(){
    if(!buying)return;
    const result=voucherResult?.valid ? voucherResult : applyVoucher(buying.price,voucher);
    const paid=result.price;
    const item:Purchase={
      id:crypto.randomUUID(),uid:buying.uid,originalPrice:buying.price,
      paidPrice:paid,voucher:result.valid?voucher.toUpperCase():undefined,
      time:new Date().toISOString()
    };
    const next=[item,...history];
    setHistory(next); localStorage.setItem(HIST,JSON.stringify(next));
    const msg=[
      `Halo Admin PIDZ STORE 👋`,
      ``,
      `Saya ingin membeli UID cantik.`,
      `UID: ${buying.uid}`,
      `Harga: ${rupiah(buying.price)}`,
      result.valid?`Voucher: ${voucher.toUpperCase()} (-${rupiah(result.discount)})`:"",
      `Total: ${rupiah(paid)}`,
      ``,
      `Saya sudah melakukan pembayaran QRIS. Mohon dicek ya.`
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank","noopener,noreferrer");
    setBuying(null);
  }

  async function copyUid(uid:string){
    await navigator.clipboard?.writeText(uid);
    setCopied(uid); setTimeout(()=>setCopied(""),1400);
  }

  const filtered=products.filter(p=>
    (selectedPrice===null||p.price===selectedPrice) &&
    p.uid.toLowerCase().includes(search.toLowerCase())
  );

  return <main className="min-h-screen">
    <AnimatePresence>
      {welcome && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06142e]/70 p-5 backdrop-blur-xl">
        <motion.div initial={{scale:.75,y:30,opacity:0}} animate={{scale:1,y:0,opacity:1}} transition={{type:"spring",stiffness:150,damping:16}} className="relative max-w-md overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-2xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200 blur-3xl"/>
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 shadow-inner">
            <Sparkles className="h-9 w-9 text-blue-600"/>
          </div>
          <p className="mb-2 text-xs font-black uppercase tracking-[.25em] text-blue-600">Welcome to</p>
          <h1 className="text-3xl font-black tracking-tight">PIDZ STORE<Verified/></h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Temukan UID cantik pilihanmu dengan proses checkout yang cepat dan simpel.</p>
          <button onClick={()=>{setWelcome(false);setJoinOpen(true)}} className="mt-7 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Mulai Belanja ✨</button>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {joinOpen && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-md">
        <motion.div initial={{y:30,scale:.96}} animate={{y:0,scale:1}} className="w-full max-w-lg rounded-[30px] bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-start justify-between">
            <div><div className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Komunitas PIDZ</div><h2 className="mt-1 text-2xl font-black">Gabung & dapatkan update</h2></div>
            <button onClick={()=>setJoinOpen(false)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5"/></button>
          </div>
          <div className="space-y-3">
            <button onClick={channel} className="flex w-full items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300">
              <div className="rounded-xl bg-blue-600 p-3 text-white"><MessageCircle/></div>
              <div className="flex-1"><div className="font-extrabold">SALURAN BAGI2 UID CANTIK DAN TESTIMONI</div><div className="text-xs text-slate-500">WhatsApp Channel</div></div><ChevronDown className="rotate-[-90deg] text-blue-500"/>
            </button>
            <a href={STORE.group} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200">
              <div className="rounded-xl bg-slate-900 p-3 text-white"><MessageCircle/></div>
              <div className="flex-1"><div className="font-extrabold">GRUP TERBUKA PIDZ UID CANTIK</div><div className="text-xs text-slate-500">Komunitas WhatsApp</div></div><ChevronDown className="rotate-[-90deg] text-slate-400"/>
            </a>
          </div>
          <button onClick={()=>setJoinOpen(false)} className="mt-5 w-full rounded-2xl bg-slate-100 py-3 font-bold text-slate-700">Lanjut ke Store</button>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    <header className="sticky top-0 z-40 border-b border-blue-100/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src={STORE.logo} alt="PIDZ STORE" width={44} height={44} className="h-11 w-11 rounded-2xl object-cover shadow-lg"/>
          <div><div className="text-lg font-black tracking-tight">PIDZ STORE<Verified/></div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">UID Cantik • Trusted Store</div></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setHistoryOpen(true)} className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:border-blue-200 hover:text-blue-600 sm:flex"><History className="h-4 w-4"/> Riwayat</button>
          <button onClick={()=>setJoinOpen(true)} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20">Komunitas</button>
        </div>
      </div>
    </header>

    <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
      <div className="shine relative overflow-hidden rounded-[28px] shadow-2xl shadow-blue-900/10">
        <Image src={STORE.banner} alt="PIDZ STORE Banner" width={1600} height={900} priority className="aspect-[16/9] w-full object-cover sm:aspect-[16/6]"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#061b4d]/80 via-[#0b4ac5]/25 to-transparent"/>
        <div className="absolute inset-0 flex items-center p-6 sm:p-10">
          <div className="max-w-lg text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur"><Zap className="h-3.5 w-3.5 fill-current"/> Koleksi UID Pilihan</div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">Cari UID cantikmu.<br/><span className="text-blue-200">Checkout lebih mudah.</span></h1>
            <p className="mt-3 hidden max-w-md text-sm leading-6 text-white/75 sm:block">List rapi, harga transparan, pembayaran QRIS, dan konfirmasi langsung ke admin.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="glass rounded-[24px] p-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nomor UID..." className="w-full rounded-2xl bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-semibold outline-none ring-0 transition focus:bg-white focus:shadow-inner"/>
          </div>
          <button onClick={()=>setHistoryOpen(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white sm:hidden"><History className="h-4 w-4"/> Riwayat Pembelian</button>
        </div>
        {categories.length>0 && <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button onClick={()=>setSelectedPrice(null)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold transition ${selectedPrice===null?"bg-blue-600 text-white":"bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>Semua Harga</button>
          {categories.map(p=><button key={p} onClick={()=>setSelectedPrice(p)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold transition ${selectedPrice===p?"bg-blue-600 text-white":"bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>{rupiah(p).replace(",00","")}</button>)}
        </div>}
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <div><div className="text-xs font-black uppercase tracking-[.2em] text-blue-600">UID tersedia</div><h2 className="mt-1 text-2xl font-black sm:text-3xl">Pilih UID favoritmu</h2></div>
        <div className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm sm:block">{filtered.length} UID</div>
      </div>

      {filtered.length===0 ? <div className="glass rounded-[28px] p-12 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"><Search className="text-blue-500"/></div><h3 className="text-lg font-black">Belum ada UID di kategori ini</h3><p className="mt-1 text-sm text-slate-500">Tambahkan UID di <code>lib/store.ts</code> untuk menampilkannya.</p></div>
      : <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {filtered.map((p,i)=><motion.article layout key={`${p.uid}-${i}`} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.035,.25)}} className="card3d glass overflow-hidden rounded-[24px]">
          <div className="relative aspect-[1.35/1] overflow-hidden bg-blue-50">
            <Image src={STORE.productImage} alt="UID" fill sizes="(max-width:640px) 50vw, 300px" className="object-cover transition duration-700 hover:scale-105"/>
            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-blue-700 shadow-sm backdrop-blur">UID CANTIK</div>
            {p.sold && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55"><span className="rounded-full bg-white px-4 py-2 text-xs font-black">SOLD</span></div>}
          </div>
          <div className="p-3.5 sm:p-4">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">UID</div>
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1 truncate text-lg font-black tracking-tight sm:text-xl">{p.uid}</div>
              <button onClick={()=>copyUid(p.uid)} className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">{copied===p.uid?<Check className="h-4 w-4"/>:<Copy className="h-4 w-4"/>}</button>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div><div className="text-[10px] font-bold text-slate-400">Harga</div><div className="text-base font-black text-blue-600 sm:text-lg">{rupiah(p.price)}</div></div>
              <button disabled={p.sold} onClick={()=>startBuy(p)} className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none sm:px-4">Beli Sekarang</button>
            </div>
          </div>
        </motion.article>)}
      </div>}
    </section>

    <footer className="border-t border-blue-100 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-center text-xs text-slate-400 sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <div>© {new Date().getFullYear()} PIDZ STORE<Verified/> • UID Cantik</div>
        <button onClick={()=>setJoinOpen(true)} className="font-bold text-blue-600">Komunitas WhatsApp</button>
      </div>
    </footer>

    <AnimatePresence>
      {buying && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-md sm:items-center sm:p-5">
        <motion.div initial={{y:40}} animate={{y:0}} exit={{y:40}} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div><div className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Checkout</div><h2 className="mt-1 text-2xl font-black">Bayar UID <Verified/></h2></div>
            <button onClick={()=>setBuying(null)} className="rounded-full bg-slate-100 p-2"><X className="h-5 w-5"/></button>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <div className="text-xs font-bold text-blue-500">UID TERPILIH</div>
            <div className="mt-1 text-2xl font-black tracking-tight">{buying.uid}</div>
            <div className="mt-1 text-sm font-bold text-slate-500">{rupiah(buying.price)}</div>
          </div>
          {voucherAvailable() && buying.price>=VOUCHER.minPrice && buying.price<=VOUCHER.maxPrice && <div className="mt-4 rounded-2xl border border-dashed border-blue-200 p-4">
            <div className="flex items-center gap-2 text-sm font-black"><Tag className="h-4 w-4 text-blue-600"/> Punya voucher?</div>
            <div className="mt-3 flex gap-2">
              <input value={voucher} onChange={e=>setVoucher(e.target.value)} placeholder="Masukkan kode" className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-100"/>
              <button onClick={checkVoucher} className="rounded-xl bg-slate-900 px-4 text-xs font-black text-white">Pakai</button>
            </div>
            {voucherResult && <div className={`mt-2 text-xs font-bold ${voucherResult.valid?"text-emerald-600":"text-red-500"}`}>{voucherResult.valid?`Voucher aktif • hemat ${rupiah(voucherResult.discount)}`:"Voucher tidak valid / tidak memenuhi syarat."}</div>}
          </div>}
          <div className="mt-5 rounded-[24px] border border-blue-100 bg-white p-4 text-center shadow-sm">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black"><QrCode className="h-5 w-5 text-blue-600"/> Scan QRIS untuk membayar</div>
            <div className="mx-auto max-w-[300px] overflow-hidden rounded-2xl bg-slate-50 p-2"><img src={STORE.qris} alt="QRIS PIDZ STORE" className="w-full rounded-xl"/></div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-400"><Clock3 className="h-4 w-4"/> Simpan bukti pembayaran</div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-bold text-slate-500">Total bayar</div>
            <div className="text-xl font-black text-blue-600">{rupiah(voucherResult?.valid?voucherResult.price:buying.price)}</div>
          </div>
          <button onClick={confirmBuy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700"><MessageCircle className="h-5 w-5"/> Konfirmasi via WhatsApp</button>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">Setelah klik, WhatsApp admin akan terbuka dengan pesan pembelian otomatis sesuai UID.</p>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {historyOpen && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[65] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-5">
        <motion.div initial={{y:30}} animate={{y:0}} className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]">
          <div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Local History</div><h2 className="text-2xl font-black">Riwayat Pembelian</h2></div><button onClick={()=>setHistoryOpen(false)} className="rounded-full bg-slate-100 p-2"><X/></button></div>
          {history.length===0?<div className="rounded-2xl bg-slate-50 p-10 text-center"><ShoppingBag className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-500">Belum ada riwayat pembelian di perangkat ini.</p></div>
          :<div className="space-y-3">{history.map(h=><div key={h.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">UID</div><div className="font-black">{h.uid}</div></div><div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">CHECKOUT</div></div><div className="mt-3 flex justify-between text-xs"><span className="text-slate-400">{new Date(h.time).toLocaleString("id-ID")}</span><span className="font-black text-blue-600">{rupiah(h.paidPrice)}</span></div></div>)}</div>}
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </main>
}