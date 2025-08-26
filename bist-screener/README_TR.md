## BIST Tarama (Next.js) — Türkçe Kullanım

Bu proje, Next.js (App Router) ve Tailwind CSS ile basit bir BIST tarama arayüzü sunar. API, örnek (mock) veri üretir. Gerçek veri sağlayıcısına bağlanmak için API kodunu güncelleyebilirsiniz.

### Başlangıç

1) Bağımlılıkları kurun (create-next-app zaten kurdu):
```
npm install
```

2) Geliştirme sunucusunu çalıştırın:
```
npm run dev
```
Tarayıcıda `http://localhost:3000` adresini açın.

### Özellikler
- 100 satırlı tablo gösterimi
- Hisse grubu seçimi (1–21)
- Mock veri ile API (`/api/scan`)

### Dosya Yapısı (ana parçalar)
- `app/page.tsx`: Arayüz, tablo ve grup seçimi
- `app/api/scan/route.ts`: Mock veriyi dönen API endpoint
- `lib/symbols.ts`: Sembol listesi ve gruplama yardımcıları
- `lib/indicators.ts`: Basit TA yardımcı fonksiyonları (örnek amaçlı)

### Gerçek Veri Entegrasyonu
`app/api/scan/route.ts` dosyasında `mockRow` ve `GET` fonksiyonlarını düzenleyerek bir veri sağlayıcıya bağlanın. Örnek akış:
- Piyasa verisi sağlayıcısı seçin (ör. Finnhub, BIST API).
- API anahtarını ortam değişkeni olarak ekleyin: `.env.local` içine `API_KEY=...` yazın.
- `GET` içinde `fetch` ile gerçek fiyat/indikator verisini çekin ve `rows` haline dönüştürün.

### Dağıtım
GitHub → Vercel (önerilen):
1) Git deposu oluşturun ve push edin:
```
git init
git add .
git commit -m "BIST tarama: Next.js + 50 satırlı tablo + mock API"
git branch -M main
git remote add origin https://github.com/<kullanici-adi>/<repo-adi>.git
git push -u origin main
```
2) `vercel.com` üzerinden “New Project” → GitHub reposunu bağlayın → “Deploy”.

CLI ile alternatif:
```
npm i -g vercel
vercel
vercel --prod
```

### Notlar
- Mock veri sadece demo amaçlıdır. Üretimde gerçek veri kaynağı kullanın.
- Tablo satır sayısı 100 olacak şekilde tasarlanmıştır.


