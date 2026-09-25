import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIDZ STORE — UID Cantik",
  description: "PIDZ STORE • Koleksi UID cantik",
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}