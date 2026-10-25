import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import accountSelectors from "src/modules/account/accountSelectors";
import assetsActions from "src/modules/assets/assetsActions";
import type { AppDispatch } from "src/modules/store";
import { useDemoStats } from "src/modules/demo/demoSelectors";
import { orderPnl } from "src/modules/tradeOrders/tradeOrdersService";
import useTradeOrders from "src/view/pages/Order/useTradeOrders";

const isToday = (iso?: string) => {
  if (!iso) return false;
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
};

// Balance-card figures for the dashboard. Demo accounts use the practice engine; real accounts
// use the server's orders, the same ones the Orders page shows. The server takes a position's
// margin out of the wallet when it opens, so the wallet balance is already the free amount.
export default function useAccountStats() {
  const isDemo = useSelector(accountSelectors.selectIsDemo);
  const balance = useSelector(accountSelectors.selectBalance);
  const demo = useDemoStats();
  const server = useTradeOrders(!isDemo);
  const dispatch = useDispatch<AppDispatch>();

  const open = server.orders.filter((o) => o.status === "active");
  const waiting = server.orders.filter((o) => o.status === "waiting").length;

  // Opening, closing (manual, TP/SL) or filling an order moves money in or out of the wallet
  // on the server, so reload the wallets whenever the set of live orders changes.
  const liveKey = `${open.length}/${waiting}`;
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (isDemo || server.loading) return;
    if (lastKey.current !== null && lastKey.current !== liveKey) dispatch(assetsActions.doFetch());
    lastKey.current = liveKey;
  }, [isDemo, server.loading, liveKey, dispatch]);

  if (isDemo) return demo;

  const floating = open.reduce((sum, o) => {
    const live = server.livePrice(o.symbol);
    return sum + (live !== null ? orderPnl(o, live) : 0);
  }, 0);
  const margin = open.reduce((sum, o) => sum + (o.estimatedMargin ?? o.margin ?? 0), 0);
  const realizedToday = server.orders
    .filter((o) => o.status === "closed" && isToday(o.closeTime))
    .reduce((sum, o) => sum + (o.pnl ?? 0), 0);

  return {
    floating,
    margin,
    equity: balance + margin + floating,
    available: balance,
    today: realizedToday + floating,
  };
}
