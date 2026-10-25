import {
  CategoryFilter,
  DemoState,
  Position,
  Quote,
  STARTING_BALANCE,
  Side,
  quotes,
} from "src/modules/demo/demoEnumerators";

// Virtual-funds trading simulator. Every fill, close, stop and take-profit uses the live
// market price from the feed; there is no other input to the result.

export function initialState(): DemoState {
  return {
    version: 2,
    name: "Demo User",
    balance: STARTING_BALANCE,
    selectedSymbol: "BTCUSD",
    marketQuotes: quotes.map((q) => ({ ...q })),
    tick: 0,
    pending: [],
    history: [],
    positions: [],
  };
}

const findQuote = (list: Quote[], symbol: string) => list.find((q) => q.symbol === symbol) as Quote;

// Price you buy at (ask) and sell at (bid); falls back to the last price when the feed has no quote.
export const buyPrice = (q: Quote) => (q.ask > 0 ? q.ask : q.price);
export const sellPrice = (q: Quote) => (q.bid > 0 ? q.bid : q.price);
// A position closes on the opposite side: a BUY closes at the bid, a SELL at the ask.
export const exitPrice = (q: Quote, side: Side) => (side === "BUY" ? sellPrice(q) : buyPrice(q));

// USD value of one unit of `currency`, from live forex prices; null when not yet known.
export function usdRate(currency: string, list: Quote[]): number | null {
  if (currency === "USD") return 1;
  const direct = list.find((q) => q.symbol === currency + "USD");
  if (direct?.ready && direct.price > 0) return direct.price;
  const inverse = list.find((q) => q.symbol === "USD" + currency);
  if (inverse?.ready && inverse.price > 0) return 1 / inverse.price;
  return null;
}

export function pnl(position: Position, list: Quote[]) {
  const quote = findQuote(list, position.symbol);
  const rate = quote ? usdRate(quote.quoteCurrency, list) : null;
  if (!quote?.ready || rate === null) return 0;
  const move = exitPrice(quote, position.side) - position.open;
  return move * position.lots * quote.contract * rate * (position.side === "BUY" ? 1 : -1);
}

export function metrics(state: DemoState) {
  const floating = state.positions.reduce((sum, p) => sum + pnl(p, state.marketQuotes), 0);
  const margin = state.positions.reduce((sum, p) => sum + p.margin, 0);
  return {
    floating,
    margin,
    equity: state.balance + floating,
    available: state.balance + floating - margin,
    today:
      floating -
      state.positions.reduce((sum, p) => sum + p.fee, 0) +
      state.history.reduce((sum, p) => sum + (p.pnl ?? 0) - p.fee, 0),
  };
}

// Why a quote can't be traded right now, or null when it can.
export function tradingBlock(quote: Quote | undefined): string | null {
  if (!quote?.ready) return "Waiting for the live price…";
  if (quote.open === false) return "Market closed. Trading resumes when it reopens.";
  return null;
}

export function closePosition(state: DemoState, id: string): DemoState {
  const position = state.positions.find((p) => p.id === id);
  if (!position) return state;
  const quote = findQuote(state.marketQuotes, position.symbol);
  if (tradingBlock(quote)) return state;
  const realized = pnl(position, state.marketQuotes);
  return {
    ...state,
    balance: state.balance + realized,
    positions: state.positions.filter((p) => p.id !== id),
    history: [
      { ...position, pnl: realized, closed: exitPrice(quote, position.side), closedAt: Date.now() },
      ...state.history,
    ],
  };
}

export function cancelPending(state: DemoState, id: string): DemoState {
  return { ...state, pending: state.pending.filter((p) => p.id !== id) };
}

export interface LiveUpdate {
  price?: number;
  bid?: number;
  ask?: number;
  change?: number;
  open?: boolean;
}

// Applies live prices, then fills limit orders and triggers stops/take-profits they reach.
export function applyLive(state: DemoState, updates: Record<string, LiveUpdate>): DemoState {
  let next: DemoState = {
    ...state,
    tick: state.tick + 1,
    marketQuotes: state.marketQuotes.map((q) => {
      const u = updates[q.symbol];
      if (!u) return q;
      const price = u.price ?? q.price;
      return {
        ...q,
        price,
        bid: u.bid ?? q.bid,
        ask: u.ask ?? q.ask,
        change: u.change ?? q.change,
        open: u.open ?? q.open,
        ready: q.ready || price > 0,
      };
    }),
  };

  for (const order of next.pending) {
    if (!updates[order.symbol]) continue;
    const quote = findQuote(next.marketQuotes, order.symbol);
    if (tradingBlock(quote)) continue;
    const fill = order.side === "BUY" ? buyPrice(quote) : sellPrice(quote);
    const reached = order.side === "BUY" ? fill <= order.open : fill >= order.open;
    if (reached && metrics(next).available >= order.margin + order.fee) {
      next = {
        ...next,
        balance: next.balance - order.fee,
        pending: next.pending.filter((p) => p.id !== order.id),
        positions: [{ ...order, open: fill, openedAt: Date.now() }, ...next.positions],
      };
    }
  }

  for (const position of next.positions) {
    if (!updates[position.symbol]) continue;
    const quote = findQuote(next.marketQuotes, position.symbol);
    if (tradingBlock(quote)) continue;
    const price = exitPrice(quote, position.side);
    const stopHit = position.stop && (position.side === "BUY" ? price <= position.stop : price >= position.stop);
    const takeHit = position.take && (position.side === "BUY" ? price >= position.take : price <= position.take);
    if (stopHit || takeHit) next = closePosition(next, position.id);
  }

  return next;
}

export interface OrderRequest {
  side: Side;
  lots: number;
  leverage: number;
  limit?: number;
  stop?: number;
  take?: number;
}

// Margin and fee in USD for an order of `lots` at `entry`; NaN until the USD rate is known.
export function orderCost(quote: Quote, entry: number, lots: number, leverage: number, list: Quote[] = []) {
  const rate = usdRate(quote.quoteCurrency, list.length ? list : [quote]) ?? NaN;
  const notional = entry * lots * quote.contract * rate;
  return { margin: notional / leverage, fee: notional * 2e-5 };
}

function newId() {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2) + Date.now().toString(16);
  return "NX-" + uuid.slice(0, 8);
}

// Throws with a user-facing message when the order is invalid.
export function createOrder(state: DemoState, request: OrderRequest): DemoState {
  const quote = findQuote(state.marketQuotes, state.selectedSymbol);
  const blocked = tradingBlock(quote);
  if (blocked) throw new Error(blocked);

  const entry = request.limit ?? (request.side === "BUY" ? buyPrice(quote) : sellPrice(quote));
  const { margin, fee } = orderCost(quote, entry, request.lots, request.leverage, state.marketQuotes);

  if (
    !Number.isFinite(request.lots) || request.lots < 0.01 || request.lots > 100 ||
    !Number.isFinite(entry) || entry <= 0 ||
    !Number.isFinite(request.leverage) || request.leverage < 1
  ) {
    throw new Error("Enter valid order values.");
  }
  if (!Number.isFinite(margin)) {
    throw new Error("Waiting for the live exchange rate for this instrument…");
  }
  if (margin + fee > metrics(state).available) {
    throw new Error("Insufficient virtual margin. Reduce the lot size.");
  }
  if (
    request.stop !== undefined &&
    (!Number.isFinite(request.stop) || request.stop <= 0 ||
      (request.side === "BUY" ? request.stop >= entry : request.stop <= entry))
  ) {
    throw new Error("Stop loss must be on the loss side of the entry price.");
  }
  if (
    request.take !== undefined &&
    (!Number.isFinite(request.take) || request.take <= 0 ||
      (request.side === "BUY" ? request.take <= entry : request.take >= entry))
  ) {
    throw new Error("Take profit must be on the profit side of the entry price.");
  }

  const order: Position = {
    id: newId(),
    symbol: quote.symbol,
    side: request.side,
    lots: request.lots,
    open: entry,
    margin,
    fee,
    stop: request.stop,
    take: request.take,
    openedAt: Date.now(),
  };

  return request.limit
    ? { ...state, pending: [order, ...state.pending] }
    : { ...state, balance: state.balance - fee, positions: [order, ...state.positions] };
}

export function filterQuotes(list: Quote[], search: string, category: CategoryFilter) {
  const term = search.toLowerCase();
  return list.filter(
    (q) => (category === "All" || q.category === category) && (q.symbol + " " + q.name).toLowerCase().includes(term),
  );
}

// Validates persisted state; anything unexpected falls back to a fresh account.
// Prices are never restored: they always come fresh from the live feed.
export function restoreState(raw: string | null): DemoState {
  if (!raw) return initialState();
  try {
    const saved = JSON.parse(raw);
    const validPosition = (p: any) =>
      p &&
      typeof p.id === "string" &&
      quotes.some((q) => q.symbol === p.symbol) &&
      ["BUY", "SELL"].includes(p.side) &&
      [p.lots, p.open, p.margin, p.fee].every(Number.isFinite) &&
      p.lots > 0 && p.open > 0 && p.margin >= 0 && p.fee >= 0 &&
      [p.stop, p.take, p.closed, p.pnl, p.openedAt, p.closedAt].every((v) => v === undefined || Number.isFinite(v));

    const valid =
      saved.version === 2 &&
      typeof saved.name === "string" && saved.name.trim() &&
      Number.isFinite(saved.balance) &&
      Number.isInteger(saved.tick) && saved.tick >= 0 &&
      quotes.some((q) => q.symbol === saved.selectedSymbol) &&
      [saved.positions, saved.pending, saved.history].every((list) => Array.isArray(list) && list.every(validPosition));
    if (!valid) return initialState();

    return { ...saved, marketQuotes: quotes.map((q) => ({ ...q })) };
  } catch {
    return initialState();
  }
}
