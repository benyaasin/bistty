// Türkçe Açıklama:
// Bu API route, örnek veri üretip (mock) tarama sonucu döndürür.
// Gerçek kullanımda buraya bir piyasa veri sağlayıcısından (ör: Finnhub, Tradier, Borsa API) veri çekerek
// göstergeleri hesaplayıp dönmeniz gerekir.

import { NextResponse } from 'next/server'
import { getSymbolsByGroup } from '@/lib/symbols'

type ScanRow = {
  symbol: string
  price: number
  changePct: number
  rsi: number | null
  sma20: boolean
  sma50: boolean
  sma100: boolean
  sma200: boolean
  macdSignal: 'AL' | 'SAT'
  bbTrend: string
  at: 'Düşüş' | 'Yükseliş'
}

async function fetchQuote(symbol: string, token: string): Promise<ScanRow> {
  const finnhubSymbol = `${symbol}.IS`
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${encodeURIComponent(token)}`
  try {
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`Finnhub error ${res.status}`)
    const q = await res.json() as { c?: number; dp?: number }
    const price = typeof q.c === 'number' ? +q.c.toFixed(2) : 0
    const changePct = typeof q.dp === 'number' ? +q.dp.toFixed(2) : 0
    const at: 'Düşüş' | 'Yükseliş' = changePct >= 0 ? 'Yükseliş' : 'Düşüş'
    const macdSignal: 'AL' | 'SAT' = changePct >= 0 ? 'AL' : 'SAT'
    return {
      symbol,
      price,
      changePct,
      rsi: null,
      sma20: false,
      sma50: false,
      sma100: false,
      sma200: false,
      macdSignal,
      bbTrend: '-',
      at,
    }
  } catch {
    return {
      symbol,
      price: 0,
      changePct: 0,
      rsi: null,
      sma20: false,
      sma50: false,
      sma100: false,
      sma200: false,
      macdSignal: 'AL',
      bbTrend: '-',
      at: 'Yükseliş',
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const groupParam = searchParams.get('group')
  const groupIndex = Math.min(Math.max(parseInt(groupParam || '1', 10) || 1, 1), 21)

  const symbols = getSymbolsByGroup(groupIndex)
  // 100 satır hedefi: Finnhub kotalarını zorlamamak için yalnızca mevcut semboller üzerinden döngü kurup 100'e tamamlarız.
  const token = process.env.FINNHUB_TOKEN || process.env.NEXT_PUBLIC_FINNHUB_TOKEN || 'd2mn1l9r01qog444f420d2mn1l9r01qog444f42g'
  const uniqueTargets = symbols.length > 0 ? symbols : []
  const fetched = await Promise.all(uniqueTargets.map(s => fetchQuote(s, token)))
  const rows: ScanRow[] = []
  for (let i = 0; i < 100; i++) {
    const row = fetched[i % Math.max(1, fetched.length)] || {
      symbol: `SYM${i + 1}`,
      price: 0,
      changePct: 0,
      rsi: null,
      sma20: false,
      sma50: false,
      sma100: false,
      sma200: false,
      macdSignal: 'AL' as const,
      bbTrend: '-',
      at: 'Yükseliş' as const,
    }
    rows.push(row)
  }

  return NextResponse.json({ group: groupIndex, rows })
}


