import type { LiveUpdate } from "src/modules/demo/demoEngine";
import { marketPairs } from "src/modules/market/marketPairs";

// Same feed as PC: TradingView's quote stream, reached through the app's own host at
// /ws/socket.io/websocket (the Vite dev proxy locally, Nginx in production), because
// TradingView rejects browsers connecting from other origins.
export function feedUrl() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/socket.io/websocket`;
}

export const encode = (message: string) => `~m~${message.length}~m~${message}`;

// Frames arrive as ~m~<length>~m~<payload>, several per WebSocket message.
export function decode(data: string): string[] {
  const messages: string[] = [];
  let rest = data;
  while (rest.startsWith("~m~")) {
    const end = rest.indexOf("~m~", 3);
    const length = parseInt(rest.substring(3, end), 10);
    messages.push(rest.substring(end + 3, end + 3 + length));
    rest = rest.substring(end + 3 + length);
  }
  return messages;
}

// Answers the feed's heartbeat; returns true when `message` was one.
export function answerHeartbeat(socket: WebSocket, message: string) {
  if (!message.startsWith("~h~")) return false;
  socket.send(encode(message));
  return true;
}

function symbolOf(name: string) {
  try {
    return JSON.parse(name.replace(/^=\{/, "{")).symbol || name;
  } catch {
    return name;
  }
}

const RECONNECT_MS = 3000;
// Updates are collected and handed over at most this often, so a busy feed doesn't re-render the app per tick.
const FLUSH_MS = 300;

let reconnectNow: (() => void) | null = null;

// Opens the live quote feed for every market pair and calls onUpdate with batches of
// changes. Returns a function that stops the feed.
export function startLiveQuotes(onUpdate: (updates: Record<string, LiveUpdate>) => void) {
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let pending: Record<string, LiveUpdate> = {};
  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  const flush = () => {
    flushTimer = undefined;
    const batch = pending;
    pending = {};
    if (Object.keys(batch).length) onUpdate(batch);
  };

  const queue = (symbol: string, update: LiveUpdate) => {
    pending[symbol] = { ...pending[symbol], ...update };
    if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
  };

  const connect = () => {
    const ws = new WebSocket(feedUrl());
    socket = ws;

    ws.onopen = () => {
      const session = "qs_" + Math.random().toString(36).substring(2, 12);
      ws.send(encode(JSON.stringify({ m: "quote_create_session", p: [session] })));
      ws.send(encode(JSON.stringify({ m: "quote_set_fields", p: [session, "lp", "ask", "bid", "chp", "current_session"] })));
      ws.send(encode(JSON.stringify({ m: "quote_add_symbols", p: [session, ...marketPairs.map((p) => p.symbol)] })));
    };

    ws.onmessage = (event) => {
      for (const message of decode(String(event.data))) {
        if (answerHeartbeat(ws, message)) continue;
        try {
          const json = JSON.parse(message);
          if (json.m !== "qsd") continue;
          const payload = json.p[1];
          const v = payload?.v;
          if (!v) continue;

          const update: LiveUpdate = {};
          if (typeof v.bid === "number" && v.bid > 0) update.bid = v.bid;
          if (typeof v.ask === "number" && v.ask > 0) update.ask = v.ask;
          if (typeof v.lp === "number" && v.lp > 0) update.price = v.lp;
          else if (update.bid && update.ask) update.price = (update.bid + update.ask) / 2;
          if (typeof v.chp === "number") update.change = v.chp;
          if (typeof v.current_session === "string") update.open = v.current_session === "market";
          if (Object.keys(update).length) queue(symbolOf(payload.n), update);
        } catch {
          // Ignore frames that aren't quote data.
        }
      }
    };

    ws.onclose = () => {
      if (socket === ws && !stopped) retry = setTimeout(connect, RECONNECT_MS);
    };
  };

  reconnectNow = () => {
    clearTimeout(retry);
    const old = socket;
    socket = null;
    old?.close();
    connect();
  };

  connect();
  return () => {
    stopped = true;
    reconnectNow = null;
    clearTimeout(retry);
    clearTimeout(flushTimer);
    socket?.close();
  };
}

// Used by the Refresh buttons: drops the connection and opens a fresh one.
export function refreshLiveQuotes() {
  reconnectNow?.();
}
