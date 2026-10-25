import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

// Same trade orders as PC's Orders page: the server holds them for real accounts.
export interface TradeOrder {
  id: string;
  _id: string;
  orderType: "market" | "pending";
  symbol: string;
  symbolName: string;
  direction: "buy" | "sell";
  lots: number;
  multiplier: number;
  margin: number;
  estimatedMargin?: number;
  fee: number;
  entryPrice?: number;
  targetPrice?: number;
  referencePrice?: number;
  triggerAbove?: boolean;
  closePrice?: number;
  takeProfit?: number | null;
  stopLoss?: number | null;
  pnl: number;
  status: "active" | "waiting" | "closed" | "cancelled";
  closeReason?: "manual" | "tp" | "sl" | "cancelled";
  orderNumber: string;
  openTime?: string;
  closeTime?: string;
  createdAt: string;
}

// Admin-driven price animation for a symbol, shared by every device (see PC useSymbolInjections).
export interface SymbolInjection {
  orderId: string;
  symbol: string;
  entryPrice: number;
  targetPrice: number;
  startedAt: number;
  durationMs: number;
  seed: number;
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

// Deterministic price of an injection right now; matches PC's chart and header.
export function injectionPrice(injection: SymbolInjection) {
  const progress = Math.min(1, Math.max(0, (Date.now() - injection.startedAt) / injection.durationMs));
  return injection.entryPrice + easeInOutSine(progress) * (injection.targetPrice - injection.entryPrice);
}

// Same P&L formula PC uses for an open position.
export function orderPnl(order: TradeOrder, livePrice: number) {
  if (!order.entryPrice) return 0;
  const diff = order.direction === "buy" ? livePrice - order.entryPrice : order.entryPrice - livePrice;
  return parseFloat((diff * order.lots * 100 - order.fee).toFixed(5));
}

export const orderId = (order: TradeOrder) => order.id || order._id;

// Order body PC's trade panels post: market orders carry entryPrice, pending ones
// targetPrice + referencePrice.
export interface NewTradeOrder {
  orderType: "market" | "pending";
  symbol: string;
  symbolName: string;
  direction: "buy" | "sell";
  lots: number;
  multiplier: number;
  takeProfit: number | null;
  stopLoss: number | null;
  entryPrice?: number;
  targetPrice?: number;
  referencePrice?: number;
}

// PC futures page: multiplier choices, margin = price × 100 × lots / (multiplier / 100),
// shown with fewer decimals as it grows, and its fixed estimated handling fee.
export const multipliers = [100, 200, 300, 400, 500];
export const estimatedMargin = (price: number, lots: number, multiplier: number) =>
  (price * 100 * lots) / (multiplier / 100);
export function formatMargin(margin: number) {
  if (margin === 0) return "0.00";
  if (margin >= 10000) return margin.toFixed(2);
  if (margin >= 100) return margin.toFixed(3);
  if (margin >= 10) return margin.toFixed(4);
  return margin.toFixed(5);
}
export const HANDLING_FEE = "0.000012";

// Live price PC's futures page trades at: the bid/ask mid, or the last price without them.
export function midPrice(bid: number, ask: number, last: number) {
  return bid > 0 && ask > 0 ? (bid + ask) / 2 : last;
}

export default class TradeOrdersService {
  static async create(order: NewTradeOrder) {
    const tenantId = AuthCurrentTenant.get();
    await authAxios.post(`/tenant/${tenantId}/trade-orders`, order);
  }

  static async list(): Promise<TradeOrder[]> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/trade-orders`);
    return response.data?.rows ?? [];
  }

  static async close(id: string, closePrice: number, closeReason: "manual" | "tp" | "sl") {
    const tenantId = AuthCurrentTenant.get();
    await authAxios.put(`/tenant/${tenantId}/trade-orders/${id}/close`, { closePrice, closeReason });
  }

  static async cancel(id: string) {
    const tenantId = AuthCurrentTenant.get();
    await authAxios.put(`/tenant/${tenantId}/trade-orders/${id}/cancel`);
  }

  static async execute(id: string, executionPrice: number) {
    const tenantId = AuthCurrentTenant.get();
    await authAxios.put(`/tenant/${tenantId}/trade-orders/${id}/execute`, { executionPrice });
  }

  // Public endpoint: injections still running, keyed by symbol.
  static async injections(): Promise<Record<string, SymbolInjection>> {
    const response = await authAxios.get("/symbol-injections-public");
    const rows: SymbolInjection[] = response.data?.injections ?? [];
    const now = Date.now();
    const map: Record<string, SymbolInjection> = {};
    rows.forEach((injection) => {
      if (injection.startedAt + injection.durationMs > now) map[injection.symbol] = injection;
    });
    return map;
  }
}
