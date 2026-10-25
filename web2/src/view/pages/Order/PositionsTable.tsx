import { ListOrdered, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import { exitPrice, pnl, tradingBlock } from "src/modules/demo/demoEngine";
import type { Position, Quote } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import { money, price } from "src/shared/Amount";
import EmptyState from "src/view/shared/EmptyState";

export type OrderMode = "Positions" | "Pending" | "History";

// Orders held by the server (real accounts): prices, P&L and actions come from the caller.
export interface ServerRows {
  current: (item: Position) => number | null;
  value: (item: Position) => number | null;
  status: (item: Position) => string;
  busyId: string | null;
  onAction: (item: Position) => void;
}

// Decimals for symbols the market list doesn't know, as on PC.
function fallbackPrice(value: number) {
  if (value >= 10000) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 100) return value.toFixed(2);
  if (value >= 10) return value.toFixed(3);
  return value.toFixed(5);
}

const show = (quote: Quote | undefined, value: number) => (quote ? price(quote, value) : fallbackPrice(value));

export default function PositionsTable({
  items,
  mode,
  server,
}: {
  items: Position[];
  mode: OrderMode;
  server?: ServerRows;
}) {
  const dispatch = useDispatch();
  const quotes = useSelector(demoSelectors.selectQuotes);

  if (!items.length) {
    return (
      <EmptyState
        icon={<ListOrdered />}
        heading={"No " + mode.toLowerCase()}
        description={
          server
            ? mode === "History"
              ? "Closed and cancelled orders will appear here."
              : "Place an order in the Trade terminal."
            : mode === "History"
              ? "Closed practice positions will appear here."
              : "Place a practice order in the Trade terminal."
        }
      />
    );
  }

  const headings = ["Symbol", "Direction", "Lots", "Open Price", mode === "History" ? "Close Price" : "Current", "Margin", "P&L", "Action"];

  return (
    <div className="table-scroll">
      <table className="positions-table">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            if (server) {
              const quote = quotes.find((q) => q.symbol === item.symbol);
              const current = item.closed !== undefined ? item.closed : server.current(item);
              const value = server.value(item);
              const busy = server.busyId === item.id;
              return (
                <tr key={item.id}>
                  <td>
                    <b>{item.symbol}</b>
                  </td>
                  <td>
                    <span className={"direction " + (item.side === "BUY" ? "buy" : "sell")}>{item.side}</span>
                  </td>
                  <td className="numeric">{item.lots.toFixed(2)}</td>
                  <td className="numeric">{show(quote, item.open)}</td>
                  <td className="numeric">{current !== null ? show(quote, current) : "—"}</td>
                  <td className="numeric">{money(item.margin)}</td>
                  <td className={"numeric " + ((value ?? 0) >= 0 ? "positive" : "negative")}>
                    {mode === "Pending" || value === null ? "—" : money(value)}
                  </td>
                  <td>
                    {mode === "History" ? (
                      <span className="text-muted">{server.status(item)}</span>
                    ) : (
                      <button
                        className="text-muted close-position"
                        disabled={busy || (mode === "Positions" && current === null)}
                        onClick={() => server.onAction(item)}
                      >
                        <X size={15} />
                        {mode === "Pending" ? (busy ? "Cancelling…" : "Cancel") : busy ? "Closing…" : "Close"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            }
            const quote = quotes.find((q) => q.symbol === item.symbol)!;
            const value = mode === "History" ? item.pnl ?? 0 : pnl(item, quotes);
            return (
              <tr key={item.id}>
                <td>
                  <b>{item.symbol}</b>
                </td>
                <td>
                  <span className={"direction " + (item.side === "BUY" ? "buy" : "sell")}>{item.side}</span>
                </td>
                <td className="numeric">{item.lots.toFixed(2)}</td>
                <td className="numeric">{price(quote, item.open)}</td>
                <td className="numeric">
                  {item.closed !== undefined
                    ? price(quote, item.closed)
                    : quote.ready
                      ? price(quote, mode === "Pending" ? quote.price : exitPrice(quote, item.side))
                      : "—"}
                </td>
                <td className="numeric">{money(item.margin)}</td>
                <td className={"numeric " + (value >= 0 ? "positive" : "negative")}>
                  {mode === "Pending" ? "—" : money(value)}
                </td>
                <td>
                  {mode === "History" ? (
                    <span className="text-muted">Closed</span>
                  ) : (
                    <button
                      className="text-muted close-position"
                      disabled={mode === "Positions" && Boolean(tradingBlock(quote))}
                      title={mode === "Positions" ? tradingBlock(quote) ?? undefined : undefined}
                      onClick={() =>
                        dispatch(
                          mode === "Pending"
                            ? demoActions.doCancelPending(item.id)
                            : demoActions.doClosePosition(item.id),
                        )
                      }
                    >
                      <X size={15} />
                      {mode === "Pending" ? "Cancel" : "Close"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
