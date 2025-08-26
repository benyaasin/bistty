// Türkçe Açıklama:
// Bu dosya, istemci tarafında basit teknik analiz hesaplamaları için yardımcı fonksiyonlar içerir.
// Gerçek zamanlı ve güvenilir hesaplamalar için sunucu tarafında veya bir veri servisinde yapılması önerilir.
// Burada örnek amaçlı minimal SMA ve RSI fonksiyonları sağlanmıştır.

export function simpleMovingAverage(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  const sum = slice.reduce((acc, v) => acc + v, 0);
  return sum / period;
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) gains += change; else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}


