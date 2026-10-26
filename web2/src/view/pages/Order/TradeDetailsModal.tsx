import { TrendingDown, TrendingUp, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef } from "react";
import type { Position } from "src/modules/demo/demoEnumerators";
import { money } from "src/shared/Amount";
import Logo from "src/view/shared/Logo";
import type { OrderMode } from "src/view/pages/Order/PositionsTable";

interface Props {
  item: Position;
  mode: OrderMode;
  // Realised (history) or floating (open) P&L; null when there is none yet.
  value: number | null;
  onClose: () => void;
}

const dateTime = (time?: number) =>
  time
    ? new Date(time).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Shareable trade card shown when a row of the orders table is clicked.
export default function TradeDetailsModal({ item, mode, value, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  const long = item.side === "BUY";
  const pnl = value ?? 0;
  const profit = pnl >= 0;
  const percent = item.margin > 0 ? (pnl / item.margin) * 100 : 0;
  const sign = profit ? "+" : "-";

  return (
    <dialog
      ref={ref}
      className={"trade-card " + (profit ? "is-profit" : "is-loss")}
      aria-label={`${item.symbol} trade details`}
      onCancel={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className="trade-card-close" onClick={onClose} aria-label="Close dialog">
        <X size={20} />
      </button>

      <div className="trade-card-times">
        <span>
          Open: <b>{dateTime(item.openedAt)}</b>
        </span>
        {mode === "History" && (
          <span>
            Close: <b>{dateTime(item.closedAt)}</b>
          </span>
        )}
      </div>

      <h2 className="trade-card-symbol">{item.symbol}</h2>
      <div className="trade-card-tags">
        <span className={"trade-card-side " + (long ? "long" : "short")}>{long ? "Long" : "Short"}</span>
        {item.leverage ? <span className="trade-card-leverage">{item.leverage}x</span> : null}
      </div>

      {mode === "Pending" ? (
        <div className="trade-card-pnl pending">Pending</div>
      ) : (
        <>
          <div className="trade-card-pnl">
            {sign}
            {Math.abs(pnl).toFixed(2)}
            <small>USD</small>
          </div>
          <div className="trade-card-percent">
            {sign}
            {Math.abs(percent).toFixed(2)}%
          </div>
        </>
      )}

      <div className="trade-card-prices">
        <div>
          <span>Lots</span>
          <b>{item.lots.toFixed(2)}</b>
        </div>
        <div>
          <span>Margin</span>
          <b>{money(item.margin)}</b>
        </div>
      </div>

      <div className="trade-card-footer">
        <div>
          <Logo />
          <span className={"trade-card-trend " + (long ? "long" : "short")}>
            {long ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {long ? "Bullish trade" : "Bearish trade"}
          </span>
        </div>
        <div className="trade-card-qr">
          <QRCodeSVG value={window.location.origin} size={92} bgColor="#ffffff" fgColor="#000000" />
        </div>
      </div>
    </dialog>
  );
}
