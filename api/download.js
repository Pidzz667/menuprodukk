// api/download.js
export default async function handler(req, res) {
    const { service, url } = req.query;

    // Ambil API Key dari Vercel Environment Variables
    const API_KEY = process.env.API_KEY || "PREMIUM04JFHDUDJAISKXNRNDIAKNX";

    const ENDPOINTS = {
        spotify: "https://hyerls.my.id/api/spotify.php",
        pinterest: "https://hyerls.my.id/api/pintv1.php",
        terabox: "https://hyerls.my.id/api/terabox.php",
        ytmp4: "https://hyerls.my.id/api/ytmp4.php",
        ytmp3: "https://hyerls.my.id/api/ytmp3.php",
        ytshort: "https://hyerls.my.id/api/ytshort.php",
        tiktok: "https://hyerls.my.id/api/tiktok.php",
        instagram: "https://hyerls.my.id/api/igdownload.php",
        capcut: "https://hyerls.my.id/api/capcut.php"
    };

    if (!service || !ENDPOINTS[service]) {
        return res.status(400).json({ error: "Layanan media tidak valid." });
    }

    if (!url) {
        return res.status(400).json({ error: "URL wajib diisi." });
    }

    try {
        const targetUrl = `${ENDPOINTS[service]}?key=${API_KEY}&url=${encodeURIComponent(url)}`;
        const response = await fetch(targetUrl);
        const data = await response.json();

        // Cross-Origin Access Header
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Gagal mengambil data dari API pusat." });
    }
}
