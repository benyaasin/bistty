// Türkçe Açıklama:
// Bu dosya, tarama ekranında kullanılan hisse/sembol listesini içerir.
// TradingView Pine Script içerisinde yer alan uzun listenin tamamını taşımak mümkün,
// ancak örnek ve dağıtılabilir bir iskelet sunmak için temsili bir alt küme kullanıyoruz.
// İhtiyaca göre bu liste genişletilebilir.

export const BIST_SYMBOLS: string[] = [
  "AEFES","AGHOL","AKBNK","AKSA","AKSEN","ALARK","ALFAS","ALTNY","ANSGR","ARCLK",
  "ASELS","ASTOR","AVPGY","BIMAS","BRSAN","BRYAT","CIMSA","DOAS","EKGYO","ENKAI",
  "EREGL","FROTO","GARAN","GENIL","GESAN","GUBRF","HALKB","HEKTS","ISCTR","ISMEN",
  "KCHOL","KRDMD","MAVI","MGROS","MPARK","ODAS","OTKAR","OYAKC","PETKM","PGSUS",
  "SAHOL","SASA","SISE","SKBNK","SOKM","TAVHL","TCELL","THYAO","TOASO","TTKOM",
  "TUPRS","TURSG","ULKER","VAKBN","VESTL","YEOTK","YKBNK","ZOREN"
];

// Gruplama mantığı: 30'arlı gruplar halinde böl.
export function getSymbolsByGroup(groupIndex: number): string[] {
  const start = (groupIndex - 1) * 30;
  const end = start + 30;
  return BIST_SYMBOLS.slice(start, end);
}


