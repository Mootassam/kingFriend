import { useEffect, useState } from "react";
import TradeOrdersService, { SymbolInjection } from "src/modules/tradeOrders/tradeOrdersService";

const POLL_MS = 8_000;

// Running admin price injections keyed by symbol, polled from the public endpoint like PC,
// so every visitor on every device animates the same move.
export default function useSymbolInjections(enabled = true): Record<string, SymbolInjection> {
  const [injections, setInjections] = useState<Record<string, SymbolInjection>>({});

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const poll = async () => {
      try {
        const next = await TradeOrdersService.injections();
        if (alive) setInjections(next);
      } catch {
        // Keep the last known injections.
      }
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [enabled]);

  return injections;
}
