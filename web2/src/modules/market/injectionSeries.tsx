import type { SymbolInjection } from "src/modules/tradeOrders/tradeOrdersService";

// Ported from PC's CustomTradingChart: draws an admin price injection as candles that are a
// pure function of the server's parameters and seed, so every device shows the same chart.

export interface InjectionBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// History length to the left of the injection, as on PC.
const HISTORY_BARS = 180;
const DAY_SECONDS = 86400;

// Deterministic pseudo-random in [-1, 1] from an integer seed.
function seededNoise(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function baseVol(symbol: string) {
  const s = symbol.toUpperCase();
  if (/BTC|ETH/.test(s)) return 0.0007;
  if (/LTC|SOL|ADA|DOT|AVAX|LINK|MATIC/.test(s)) return 0.0005;
  if (/XAU|GOLD/.test(s)) return 0.00015;
  if (/XAG|SILVER/.test(s)) return 0.0002;
  if (/JPY/.test(s)) return 0.00022;
  if (/US30|NAS100|SPX|GER|UK100|FRA|AUS200|JPN/.test(s)) return 0.00025;
  if (/OIL|BRENT|WTI|CRUDE/.test(s)) return 0.00035;
  return 0.0001;
}

// PC scales volatility by √minutes (1m: 1, 30m: 5.48, 1h: 7.75) and caps daily at 21.9.
const volScale = (bucketSeconds: number) =>
  bucketSeconds >= DAY_SECONDS ? 21.9 : Math.sqrt(bucketSeconds / 60);

export function buildInjectionSeries(
  injection: SymbolInjection,
  bucketSeconds: number,
  nowMs: number,
): InjectionBar[] {
  const count = bucketSeconds >= DAY_SECONDS ? 150 : HISTORY_BARS;
  const entry = injection.entryPrice;
  const target = injection.targetPrice;
  const dist = target - entry;
  const progress = Math.min(1, Math.max(0, (nowMs - injection.startedAt) / injection.durationMs));

  // One natural candle body for this symbol/timeframe.
  const natStep = Math.max(entry * baseVol(injection.symbol) * volScale(bucketSeconds), entry * 1e-6);
  // As many small candles as the move needs, so no single candle looks oversized.
  const n = Math.max(50, Math.min(220, Math.round(Math.abs(dist) / (natStep * 0.4)) || 50));
  const revealed = Math.max(1, Math.min(n, Math.round(progress * n)));
  const nowBucket = Math.floor(nowMs / 1000 / bucketSeconds) * bucketSeconds;

  // Homing random walk with auto-correlated noise, tapering onto the target.
  const avgDrift = Math.abs(dist) / n;
  const swingAmp = Math.max(natStep, avgDrift * 2.5);
  const tail = Math.max(2, Math.round(n * 0.1));
  const closes: number[] = new Array(n + 1);
  closes[0] = entry;
  let momentum = 0;
  for (let i = 1; i <= n; i++) {
    const homeDrift = (target - closes[i - 1]) / (n - (i - 1));
    momentum = 0.55 * momentum + 0.85 * seededNoise(injection.seed + i * 7);
    const taper = Math.min(1, (n - i) / tail);
    closes[i] = closes[i - 1] + homeDrift + momentum * swingAmp * taper;
  }
  closes[n] = target;

  const injected: InjectionBar[] = [];
  for (let i = 1; i <= revealed; i++) {
    const open = closes[i - 1];
    const close = closes[i];
    const wickRef = Math.max(natStep, Math.abs(close - open));
    injected.push({
      time: nowBucket - (revealed - i) * bucketSeconds,
      open,
      high: Math.max(open, close) + Math.abs(seededNoise(injection.seed + i * 13 + 1)) * wickRef * 0.5,
      low: Math.min(open, close) - Math.abs(seededNoise(injection.seed + i * 13 + 2)) * wickRef * 0.5,
      close,
    });
  }

  // Seeded history ending exactly at the entry price.
  const firstTime = nowBucket - (revealed - 1) * bucketSeconds;
  const hvol = baseVol(injection.symbol) * volScale(bucketSeconds);
  const history: number[] = [entry];
  for (let k = 1; k <= count; k++) {
    const prev = history[k - 1];
    history.push(Math.max(prev * 0.5, prev - seededNoise(injection.seed + 9000 + k) * hvol * prev));
  }
  history.reverse();

  const bars: InjectionBar[] = [];
  for (let k = 0; k < count; k++) {
    const open = history[k];
    const close = history[k + 1];
    const wick =
      Math.max(Math.abs(close - open), entry * 0.00005) *
      (0.5 + Math.abs(seededNoise(injection.seed + 20000 + k)) * 1.6);
    bars.push({
      time: firstTime - (count - k) * bucketSeconds,
      open,
      high: Math.max(open, close) + wick * 0.4,
      low: Math.min(open, close) - wick * 0.4,
      close,
    });
  }

  return [...bars, ...injected];
}
