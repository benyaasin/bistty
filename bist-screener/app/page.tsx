// Türkçe Açıklama:
// Bu sayfa, API'den aldığı verilerle 50 satırlı bir tablo gösterir.
// Üstte grup seçimi (1-21) bulunur. Veriler mock olup, gerçek veri sağlayıcıya
// bağlanınca API mantığı kolayca değiştirilebilir.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Row = {
  symbol: string;
  price: number;
  changePct: number;
  rsi: number | null;
  sma20: boolean;
  sma50: boolean;
  sma100: boolean;
  sma200: boolean;
  macdSignal: "AL" | "SAT";
  bbTrend: string;
  at: "Düşüş" | "Yükseliş";
};

type Tick = { p: number; t: number };

export default function Home() {
  const [group, setGroup] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<"symbol" | "price" | "changePct" | "rsi" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string>("ASELS");
  const [ticks, setTicks] = useState<Tick[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/scan?group=${group}`);
      const data = await res.json();
      setRows(data.rows || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  // Canlı veri için Finnhub WebSocket
  useEffect(() => {
    try {
      wsRef.current?.close();
    } catch {}
    setTicks([]);
    const token = (process.env.NEXT_PUBLIC_FINNHUB_TOKEN as string) || "d2mn1l9r01qog444f420d2mn1l9r01qog444f42g";
    const url = `wss://ws.finnhub.io?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      const finnhubSymbol = `${selected}.IS`;
      ws.send(JSON.stringify({ type: "subscribe", symbol: finnhubSymbol }));
    });
    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as { data?: Array<{ p: number; t: number }> };
        if (Array.isArray(data.data)) {
          setTicks((prev) => {
            const next = [...prev, ...data.data.map((d) => ({ p: d.p, t: d.t }))];
            return next.slice(-200);
          });
        }
      } catch {}
    });
    return () => {
      try {
        const finnhubSymbol = `${selected}.IS`;
        ws.send(JSON.stringify({ type: "unsubscribe", symbol: finnhubSymbol }));
      } catch {}
      try { ws.close(); } catch {}
    };
  }, [selected]);

  const lastPrice = useMemo(() => (ticks.length ? ticks[ticks.length - 1].p : null), [ticks]);

  return (
    <div className="min-h-screen p-6 text-sm">
      <main className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">BIST Tarama (100 satır)</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="group" className="font-medium">
              Hisse Grubu:
            </label>
            <select
              id="group"
              className="border rounded px-2 py-1"
              value={group}
              onChange={(e) => setGroup(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 21 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Hisseler {i + 1}
                </option>
              ))}
            </select>
            <button
              onClick={load}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Yenile
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="mb-4 flex items-center gap-3">
            <label className="font-medium">Canlı Sembol:</label>
            <select
              className="border rounded px-2 py-1"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {Array.from(new Set(rows.map((r) => r.symbol))).map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
            <div className="text-sm">
              Anlık Fiyat: {lastPrice ? lastPrice.toFixed(2) : "-"}
            </div>
          </div>

          <MiniChart ticks={ticks} />
          <table className="min-w-full border">
            <thead className="bg-blue-50">
              <tr>
                <th className="border px-2 py-1 text-left">No</th>
                <th className="border px-2 py-1 text-left">
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      if (sortKey === "symbol") setSortDir(sortDir === "asc" ? "desc" : "asc");
                      setSortKey("symbol");
                    }}
                  >
                    Hisse {sortKey === "symbol" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="border px-2 py-1 text-right">
                  <button
                    className="w-full text-right"
                    onClick={() => {
                      if (sortKey === "price") setSortDir(sortDir === "asc" ? "desc" : "asc");
                      setSortKey("price");
                    }}
                  >
                    Fiyat {sortKey === "price" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="border px-2 py-1 text-right">
                  <button
                    className="w-full text-right"
                    onClick={() => {
                      if (sortKey === "changePct") setSortDir(sortDir === "asc" ? "desc" : "asc");
                      setSortKey("changePct");
                    }}
                  >
                    Değişim % {sortKey === "changePct" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="border px-2 py-1 text-right">
                  <button
                    className="w-full text-right"
                    onClick={() => {
                      if (sortKey === "rsi") setSortDir(sortDir === "asc" ? "desc" : "asc");
                      setSortKey("rsi");
                    }}
                  >
                    RSI {sortKey === "rsi" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="border px-2 py-1 text-center">SMA</th>
                <th className="border px-2 py-1 text-center">MACD</th>
                <th className="border px-2 py-1 text-center">BB Trend</th>
                <th className="border px-2 py-1 text-center">AT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                (() => {
                  const base = rows.slice(0, 100);
                  if (!sortKey) return base.map((r, idx) => ({ r, idx }));
                  const sorted = [...base].sort((a, b) => {
                    const dir = sortDir === "asc" ? 1 : -1;
                    if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol) * dir;
                    if (sortKey === "price") return (a.price - b.price) * dir;
                    if (sortKey === "changePct") return (a.changePct - b.changePct) * dir;
                    if (sortKey === "rsi") return (a.rsi - b.rsi) * dir;
                    return 0;
                  });
                  return sorted.map((r, idx) => ({ r, idx }));
                })().map(({ r, idx }) => {
                  const cellBg =
                    r.changePct < 0
                      ? "bg-red-50"
                      : r.changePct > 0
                      ? "bg-teal-50"
                      : "bg-gray-50";
                  const textColor =
                    r.changePct < 0
                      ? "text-red-600"
                      : r.changePct > 0
                      ? "text-teal-700"
                      : "text-gray-600";
                  const smaTxt = [
                    r.sma200 ? "🟢" : "🔴",
                    r.sma100 ? "🟢" : "🔴",
                    r.sma50 ? "🟢" : "🔴",
                    r.sma20 ? "🟢" : "🔴",
                  ].join("");
                  return (
                    <tr key={idx} className={`${cellBg} ${textColor}`}>
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1">{r.symbol}</td>
                      <td className="border px-2 py-1 text-right">
                        {r.price.toFixed(2)}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {r.changePct.toFixed(2)}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {r.rsi === null ? "-" : r.rsi.toFixed(2)}
                      </td>
                      <td className="border px-2 py-1 text-center">{smaTxt}</td>
                      <td className="border px-2 py-1 text-center">
                        {r.macdSignal}
                      </td>
                      <td className="border px-2 py-1 text-center">{r.bbTrend}</td>
                      <td className="border px-2 py-1 text-center">{r.at}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function MiniChart({ ticks }: { ticks: Tick[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (ticks.length < 2) return;
    const prices = ticks.map((t) => t.p);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = Math.max(1e-6, max - min);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ticks.forEach((t, i) => {
      const x = (i / (ticks.length - 1)) * (width - 10) + 5;
      const y = height - ((t.p - min) / range) * (height - 10) - 5;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [ticks]);
  return (
    <div className="mb-4 border rounded p-2">
      <canvas ref={canvasRef} width={600} height={160} />
    </div>
  );
}
