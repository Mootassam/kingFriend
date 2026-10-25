import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import demoSelectors from "src/modules/demo/demoSelectors";
import TradeOrdersService, { TradeOrder, injectionPrice, orderId } from "src/modules/tradeOrders/tradeOrdersService";
import useSymbolInjections from "src/modules/tradeOrders/useSymbolInjections";

const REFRESH_MS = 15_000;

// Server-held orders for a real account, with the same behaviour as PC's Orders page:
// periodic refresh, live prices, admin price injections, automatic take-profit/stop-loss
// and pending-order triggers, manual close and cancel.
export default function useTradeOrders(enabled: boolean) {
  const quotes = useSelector(demoSelectors.selectQuotes);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const injections = useSymbolInjections(enabled);

  // Prevent double auto-close / double auto-execute while a request is in flight.
  const autoClosing = useRef<Set<string>>(new Set());
  const autoExecuting = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;
    try {
      setOrders(await TradeOrdersService.list());
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Periodic refresh also lets expired injections finalize on the server and credit the wallet.
  useEffect(() => {
    if (!enabled) return;
    fetchOrders();
    const id = setInterval(fetchOrders, REFRESH_MS);
    return () => clearInterval(id);
  }, [enabled, fetchOrders]);

  // Raw feed price, as PC's own quote socket reports it.
  const feedPrice = useCallback(
    (symbol: string) => {
      const quote = quotes.find((q) => q.symbol === symbol);
      return quote?.ready && quote.price > 0 ? quote.price : null;
    },
    [quotes],
  );

  // Price shown and used for P&L: follows a running injection, like PC.
  const livePrice = useCallback(
    (symbol: string) => {
      const price = feedPrice(symbol);
      const injection = injections[symbol];
      return injection && price !== null ? injectionPrice(injection) : price;
    },
    [feedPrice, injections],
  );

  // Automatic take-profit / stop-loss and pending triggers, on every price update.
  useEffect(() => {
    if (!enabled) return;

    orders
      .filter((o) => o.status === "active")
      .forEach((order) => {
        const price = feedPrice(order.symbol);
        if (price === null) return;
        const id = orderId(order);
        if (autoClosing.current.has(id)) return;
        // An admin injection decides the outcome while it animates this symbol.
        if (injections[order.symbol]) return;

        let reason: "tp" | "sl" | null = null;
        if (order.takeProfit) {
          if (order.direction === "buy" && price >= order.takeProfit) reason = "tp";
          if (order.direction === "sell" && price <= order.takeProfit) reason = "tp";
        }
        if (!reason && order.stopLoss) {
          if (order.direction === "buy" && price <= order.stopLoss) reason = "sl";
          if (order.direction === "sell" && price >= order.stopLoss) reason = "sl";
        }
        if (reason) {
          autoClosing.current.add(id);
          TradeOrdersService.close(id, price, reason)
            .then(fetchOrders)
            .catch(() => {})
            .finally(() => autoClosing.current.delete(id));
        }
      });

    orders
      .filter((o) => o.status === "waiting")
      .forEach((order) => {
        const price = feedPrice(order.symbol);
        if (price === null || order.targetPrice == null) return;
        const id = orderId(order);
        if (autoExecuting.current.has(id)) return;
        const triggered = order.triggerAbove ? price >= order.targetPrice : price <= order.targetPrice;
        if (triggered) {
          autoExecuting.current.add(id);
          TradeOrdersService.execute(id, price)
            .then(fetchOrders)
            .catch(() => {})
            .finally(() => autoExecuting.current.delete(id));
        }
      });
  }, [enabled, orders, feedPrice, injections, fetchOrders]);

  const close = useCallback(
    async (order: TradeOrder) => {
      const price = livePrice(order.symbol);
      if (price === null) return;
      const id = orderId(order);
      setBusyId(id);
      try {
        await TradeOrdersService.close(id, price, "manual");
        await fetchOrders();
      } catch {
        alert("Failed to close position. Please try again.");
      } finally {
        setBusyId(null);
      }
    },
    [livePrice, fetchOrders],
  );

  const cancel = useCallback(
    async (order: TradeOrder) => {
      const id = orderId(order);
      setBusyId(id);
      try {
        await TradeOrdersService.cancel(id);
        await fetchOrders();
      } catch {
        alert("Failed to cancel order. Please try again.");
      } finally {
        setBusyId(null);
      }
    },
    [fetchOrders],
  );

  return { orders, loading, busyId, livePrice, close, cancel, refresh: fetchOrders };
}
