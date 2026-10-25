import { marketPairs } from "src/modules/market/marketPairs";

export type Category = "Forex" | "Crypto" | "Commodities" | "Indices";
export type Side = "BUY" | "SELL";

export interface Quote {
  symbol: string;
  name: string;
  category: Category;
  // Last traded (or mid) price from the live feed; 0 until the first update arrives.
  price: number;
  bid: number;
  ask: number;
  change: number;
  precision: number;
  // Units per lot (e.g. 100,000 for forex, 100 oz for gold).
  contract: number;
  // Currency the price is quoted in; P&L is converted to USD with live rates.
  quoteCurrency: string;
  // True once the live feed has sent a price.
  ready: boolean;
  // From the live feed: false while the market is closed, null until known.
  open: boolean | null;
}

export interface Position {
  id: string;
  symbol: string;
  side: Side;
  lots: number;
  open: number;
  margin: number;
  fee: number;
  stop?: number;
  take?: number;
  closed?: number;
  pnl?: number;
  openedAt?: number;
  closedAt?: number;
}

export interface DemoState {
  version: 2;
  name: string;
  balance: number;
  selectedSymbol: string;
  marketQuotes: Quote[];
  tick: number;
  pending: Position[];
  history: Position[];
  positions: Position[];
}

export const STARTING_BALANCE = 10000;

// Contract size, quote currency and display decimals for each instrument.
const specs: Record<string, [contract: number, quoteCurrency: string, precision: number]> = {
  XAUUSD: [100, "USD", 2],
  XAGUSD: [5000, "USD", 3],
  USOIL: [1000, "USD", 2],
  UKOIL: [1000, "USD", 2],
  BTCUSD: [1, "USD", 2],
  ETHUSD: [1, "USD", 2],
  LTCUSD: [1, "USD", 3],
  NAS100: [1, "USD", 1],
  SPX500: [1, "USD", 1],
  US30: [1, "USD", 1],
  UK100: [1, "GBP", 1],
  GER30: [1, "EUR", 1],
  FRA40: [1, "EUR", 1],
  ESP35: [1, "EUR", 1],
  AUS200: [1, "AUD", 1],
  JPN225: [1, "JPY", 0],
};

const forexSpec = (symbol: string): [number, string, number] => {
  const quoteCurrency = symbol.slice(3);
  return [100000, quoteCurrency, quoteCurrency === "JPY" ? 3 : 5];
};

export const quotes: Quote[] = marketPairs.map((pair) => {
  const [contract, quoteCurrency, precision] = specs[pair.symbol] ?? forexSpec(pair.symbol);
  return {
    symbol: pair.symbol,
    name: pair.name,
    category: pair.category,
    price: 0,
    bid: 0,
    ask: 0,
    change: 0,
    precision,
    contract,
    quoteCurrency,
    ready: false,
    open: null,
  };
});

export const categories = ["All", "Forex", "Crypto", "Commodities", "Indices"] as const;
export type CategoryFilter = (typeof categories)[number];

// Display order used by the trade terminal's market watch (same order as the Markets page).
export const watchOrder = marketPairs.map((pair) => pair.symbol);

export const timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"] as const;
export type Timeframe = (typeof timeframes)[number];
// Resolution codes the live chart feed expects for each timeframe.
export const timeframeResolution: Record<Timeframe, string> = {
  M1: "1", M5: "5", M15: "15", M30: "30", H1: "60", H4: "240", D1: "1D",
};
export const timeframeSeconds: Record<Timeframe, number> = {
  M1: 60, M5: 300, M15: 900, M30: 1800, H1: 3600, H4: 14400, D1: 86400,
};

export const leverages = [1, 10, 20, 50, 100];
