import { Activity } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import accountSelectors from "src/modules/account/accountSelectors";
import { refreshLiveQuotes } from "src/modules/market/liveQuotesService";
import demoSelectors, { useDemoStats } from "src/modules/demo/demoSelectors";
import type { Position } from "src/modules/demo/demoEnumerators";
import { TradeOrder, orderId, orderPnl } from "src/modules/tradeOrders/tradeOrdersService";
import { money } from "src/shared/Amount";
import SwitchTab from "src/view/shared/SwitchTab";
import PositionsTable, { OrderMode, ServerRows } from "src/view/pages/Order/PositionsTable";
import useTradeOrders from "src/view/pages/Order/useTradeOrders";

const tabs: readonly OrderMode[] = ["Positions", "Pending", "History"];

// Server order in the shape the positions table renders.
const toRow = (order: TradeOrder): Position => ({
  id: orderId(order),
  symbol: order.symbol,
  side: order.direction === "buy" ? "BUY" : "SELL",
  lots: order.lots,
  open: (order.status === "waiting" ? order.targetPrice : order.entryPrice) ?? 0,
  margin: order.estimatedMargin ?? order.margin ?? 0,
  fee: order.fee ?? 0,
  stop: order.stopLoss ?? undefined,
  take: order.takeProfit ?? undefined,
  closed: order.status === "closed" ? order.closePrice : undefined,
  pnl: order.pnl,
});

export default function OrderPage() {
  const demo = useSelector(demoSelectors.selectRaw);
  const isDemo = useSelector(accountSelectors.selectIsDemo);
  const balance = useSelector(accountSelectors.selectBalance);
  const stats = useDemoStats();
  const [tab, setTab] = useState<OrderMode>("Positions");

  // Real accounts trade on the server, exactly like PC's Orders page; demo accounts keep
  // their practice positions.
  const server = useTradeOrders(!isDemo);
  const byId = useMemo(() => new Map(server.orders.map((o) => [orderId(o), o])), [server.orders]);
  const active = server.orders.filter((o) => o.status === "active");
  const waiting = server.orders.filter((o) => o.status === "waiting");
  const history = server.orders.filter((o) => o.status === "closed" || o.status === "cancelled");

  const serverFloating = active.reduce((sum, o) => {
    const live = server.livePrice(o.symbol);
    return sum + (live !== null ? orderPnl(o, live) : 0);
  }, 0);

  const positionsCount = isDemo ? demo.positions.length : active.length;
  const floating = isDemo ? stats.floating : serverFloating;
  const items = isDemo
    ? tab === "Positions" ? demo.positions : tab === "Pending" ? demo.pending : demo.history
    : (tab === "Positions" ? active : tab === "Pending" ? waiting : history).map(toRow);

  const rows: ServerRows | undefined = isDemo
    ? undefined
    : {
        current: (item) => server.livePrice(item.symbol),
        value: (item) => {
          const order = byId.get(item.id);
          if (!order) return null;
          if (order.status === "cancelled") return null;
          if (order.status === "closed") return order.pnl ?? 0;
          const live = server.livePrice(order.symbol);
          return live !== null ? orderPnl(order, live) : null;
        },
        status: (item) => {
          const order = byId.get(item.id);
          if (order?.status === "cancelled") return "Cancelled";
          if (order?.closeReason === "tp" || order?.closeReason === "sl") return "Closed · " + order.closeReason.toUpperCase();
          return "Closed";
        },
        busyId: server.busyId,
        onAction: (item) => {
          const order = byId.get(item.id);
          if (!order) return;
          if (order.status === "waiting") server.cancel(order);
          else server.close(order);
        },
      };

  // The balance can be zero on a real account, which would turn the percentage into NaN.
  const floatingPercent = balance > 0 ? (floating / balance) * 100 : 0;

  const refresh = () => {
    refreshLiveQuotes();
    if (!isDemo) server.refresh();
  };

  return (
    <div className="orders-page">
      <div className="orders-banner">
        <h1>Orders</h1>
        <SwitchTab
          items={tabs}
          value={tab}
          onChange={setTab}
          className="order-tabs"
          badges={{ Positions: positionsCount }}
        />
        <span className="positions-count">{positionsCount} open positions</span>
      </div>
      <div className={"floating-card " + (floating >= 0 ? "profit" : "loss")}>
        <span className="floating-icon">
          <Activity />
        </span>
        <div>
          <small>FLOATING P&amp;L</small>
          <p>{positionsCount} positions open</p>
        </div>
        <div className="right">
          <strong className="numeric">{money(floating)}</strong>
          <b>{floatingPercent.toFixed(2)}%</b>
        </div>
      </div>
      <div className="table-toolbar">
        <span>
          Open: <b>{positionsCount}</b> &nbsp; Floating P&amp;L:{" "}
          <b className={floating >= 0 ? "positive" : "negative"}>{money(floating)}</b>
        </span>
        <button onClick={refresh}>Refresh</button>
      </div>
      {!isDemo && server.loading ? null : <PositionsTable items={items} mode={tab} server={rows} />}
    </div>
  );
}
