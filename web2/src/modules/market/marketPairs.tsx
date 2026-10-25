export type MarketCategory = "Forex" | "Crypto" | "Commodities" | "Indices";

export interface MarketPair {
  symbol: string;
  name: string;
  category: MarketCategory;
}

const rows: [string, string, MarketCategory][] = [
  ["XAUUSD", "Gold / US Dollar", "Commodities"],
  ["XAGUSD", "Silver / US Dollar", "Commodities"],
  ["EURUSD", "Euro / US Dollar", "Forex"],
  ["GBPUSD", "British Pound / US Dollar", "Forex"],
  ["AUDUSD", "Australian Dollar / US Dollar", "Forex"],
  ["USDJPY", "US Dollar / Japanese Yen", "Forex"],
  ["NZDUSD", "New Zealand Dollar / US Dollar", "Forex"],
  ["USDCHF", "US Dollar / Swiss Franc", "Forex"],
  ["USDCAD", "US Dollar / Canadian Dollar", "Forex"],
  ["EURJPY", "Euro / Japanese Yen", "Forex"],
  ["EURCHF", "Euro / Swiss Franc", "Forex"],
  ["EURNZD", "Euro / New Zealand Dollar", "Forex"],
  ["EURAUD", "Euro / Australian Dollar", "Forex"],
  ["EURCAD", "Euro / Canadian Dollar", "Forex"],
  ["EURGBP", "Euro / British Pound", "Forex"],
  ["GBPJPY", "British Pound / Japanese Yen", "Forex"],
  ["GBPAUD", "British Pound / Australian Dollar", "Forex"],
  ["GBPNZD", "British Pound / New Zealand Dollar", "Forex"],
  ["AUDJPY", "Australian Dollar / Japanese Yen", "Forex"],
  ["AUDNZD", "Australian Dollar / New Zealand Dollar", "Forex"],
  ["CADJPY", "Canadian Dollar / Japanese Yen", "Forex"],
  ["NZDJPY", "New Zealand Dollar / Japanese Yen", "Forex"],
  ["USOIL", "WTI Crude Oil", "Commodities"],
  ["UKOIL", "Brent Crude Oil", "Commodities"],
  ["BTCUSD", "Bitcoin / US Dollar", "Crypto"],
  ["ETHUSD", "Ethereum / US Dollar", "Crypto"],
  ["LTCUSD", "Litecoin / US Dollar", "Crypto"],
  ["NAS100", "Nasdaq 100", "Indices"],
  ["SPX500", "S&P 500", "Indices"],
  ["US30", "Dow Jones 30", "Indices"],
  ["UK100", "FTSE 100", "Indices"],
  ["GER30", "DAX 30", "Indices"],
  ["FRA40", "CAC 40", "Indices"],
  ["ESP35", "IBEX 35", "Indices"],
  ["AUS200", "ASX 200", "Indices"],
  ["JPN225", "Nikkei 225", "Indices"],
];

// Same instruments as PC's market page (src/view/shared/pairConfig.tsx).
export const marketPairs: MarketPair[] = rows.map(([symbol, name, category]) => ({ symbol, name, category }));
