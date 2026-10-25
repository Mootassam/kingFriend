import { answerHeartbeat, decode, encode, feedUrl } from "src/modules/market/liveQuotesService";

export interface FeedCandle {
  time: number; // seconds since epoch, start of the bar
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Handlers {
  // The full history once it has loaded.
  onHistory: (candles: FeedCandle[]) => void;
  // A new or changed bar after that (usually the latest one).
  onUpdate: (candle: FeedCandle) => void;
  onError?: (message: string) => void;
}

const HISTORY_BARS = 300;
const RECONNECT_MS = 3000;

const toCandle = (v: number[]): FeedCandle | null =>
  Array.isArray(v) && v.length >= 5 && v.slice(0, 5).every(Number.isFinite)
    ? { time: v[0], open: v[1], high: v[2], low: v[3], close: v[4], volume: Number.isFinite(v[5]) ? v[5] : 0 }
    : null;

// Real candles for one instrument and resolution from the same TradingView feed as the quotes:
// the last HISTORY_BARS bars, then live updates. Returns a function that stops it.
export function subscribeCandles(symbol: string, resolution: string, handlers: Handlers) {
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const connect = () => {
    const ws = new WebSocket(feedUrl());
    socket = ws;
    let historyLoaded = false;
    const send = (m: string, p: unknown[]) => ws.send(encode(JSON.stringify({ m, p })));

    ws.onopen = () => {
      const session = "cs_" + Math.random().toString(36).substring(2, 14);
      send("set_auth_token", ["unauthorized_user_token"]);
      send("chart_create_session", [session, ""]);
      send("resolve_symbol", [session, "sds_sym_1", "=" + JSON.stringify({ symbol, adjustment: "splits" })]);
      send("create_series", [session, "sds_1", "s1", "sds_sym_1", resolution, HISTORY_BARS, ""]);
    };

    ws.onmessage = (event) => {
      for (const message of decode(String(event.data))) {
        if (answerHeartbeat(ws, message)) continue;
        try {
          const json = JSON.parse(message);
          if (json.m === "symbol_error" || json.m === "series_error") {
            handlers.onError?.("This chart isn't available right now.");
            continue;
          }
          if (json.m !== "timescale_update" && json.m !== "du") continue;
          const bars = ((json.p?.[1]?.sds_1?.s as { v: number[] }[]) || [])
            .map((bar) => toCandle(bar.v))
            .filter((c): c is FeedCandle => c !== null);
          if (!bars.length) continue;
          if (!historyLoaded && json.m === "timescale_update") {
            historyLoaded = true;
            handlers.onHistory(bars);
          } else if (historyLoaded) {
            bars.forEach(handlers.onUpdate);
          }
        } catch {
          // Ignore frames that aren't chart data.
        }
      }
    };

    ws.onclose = () => {
      if (socket === ws && !stopped) retry = setTimeout(connect, RECONNECT_MS);
    };
  };

  connect();
  return () => {
    stopped = true;
    clearTimeout(retry);
    socket?.close();
  };
}
