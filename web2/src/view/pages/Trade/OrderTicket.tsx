import { CircleCheck, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import accountSelectors from "src/modules/account/accountSelectors";
import assetsActions from "src/modules/assets/assetsActions";
import assetsSelectors from "src/modules/assets/assetsSelectors";
import demoActions from "src/modules/demo/demoActions";
import { buyPrice, orderCost, sellPrice, tradingBlock } from "src/modules/demo/demoEngine";
import { Quote, Side, leverages } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import type { AppDispatch } from "src/modules/store";
import TradeOrdersService, {
  HANDLING_FEE,
  estimatedMargin,
  formatMargin,
  midPrice,
  multipliers,
} from "src/modules/tradeOrders/tradeOrdersService";
import { money } from "src/shared/Amount";
import SwitchTab from "src/view/shared/SwitchTab";
import Modal from "src/view/shared/modals/Modal";

const ticketTabs = ["Market Price", "Pending Orders"] as const;

export default function OrderTicket({ quote }: { quote: Quote }) {
  const dispatch = useDispatch<AppDispatch>();
  // The balance the account can actually spend: the wallets on the server for a real
  // account, the virtual funds for a demo one.
  const balance = useSelector(accountSelectors.selectBalance);
  const balanceLoaded = useSelector(accountSelectors.selectBalanceLoaded);
  const quotes = useSelector(demoSelectors.selectQuotes);
  // Real accounts send orders to the server through PC's trade-orders API; demo accounts
  // keep practising with virtual funds.
  const isDemo = useSelector(accountSelectors.selectIsDemo);
  const history = useHistory();
  // PC's futures page spends the USDT wallet.
  const usdt = useSelector(assetsSelectors.selectRows).find((w) => w.symbol === "USDT")?.amount ?? 0;
  const [placing, setPlacing] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const [ticket, setTicket] = useState<(typeof ticketTabs)[number]>("Market Price");
  const [lotsInput, setLotsInput] = useState("0.01");
  const [leverage, setLeverage] = useState(100);
  const [stopOn, setStopOn] = useState(false);
  const [takeOn, setTakeOn] = useState(false);
  const [stop, setStop] = useState("");
  const [take, setTake] = useState("");
  const [limit, setLimit] = useState("");
  const [confirmSide, setConfirmSide] = useState<Side | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const pendingMode = ticket === "Pending Orders";
  const lots = Number(lotsInput);
  // Market orders fill at the live ask (buy) or bid (sell); the estimate uses the ask.
  const livePrice = quote.ready ? midPrice(quote.bid, quote.ask, quote.price) : null;
  const entry = pendingMode ? Number(limit) : isDemo ? buyPrice(quote) : livePrice ?? 0;
  const demoCost = orderCost(quote, entry, lots, leverage, quotes);
  // Real accounts follow PC's futures page: the margin is always estimated at the live price.
  const realMargin = Number(formatMargin(estimatedMargin(livePrice ?? 0, lots, leverage)));
  const margin = isDemo ? demoCost.margin : realMargin;
  const fee = isDemo ? demoCost.fee : 0;
  const insufficient = !isDemo && realMargin > 0 && usdt < realMargin;
  const blocked = isDemo ? tradingBlock(quote) : livePrice === null ? "Waiting for the live price…" : null;
  const valid = !blocked && !insufficient && lots >= 0.01 && lots <= 100 && entry > 0;
  const marginText = "$" + formatMargin(realMargin);

  // SL/TP start at the live price when switched on, as on PC.
  const seed = (fallback: number) => (isDemo ? fallback.toFixed(quote.precision) : String(livePrice ?? 0));

  async function placeOnServer(side: Side) {
    if (livePrice === null) return;
    setPlacing(true);
    try {
      await TradeOrdersService.create({
        orderType: pendingMode ? "pending" : "market",
        symbol: quote.symbol,
        symbolName: quote.name,
        direction: side === "BUY" ? "buy" : "sell",
        lots,
        multiplier: leverage,
        takeProfit: takeOn ? Number(take) : null,
        stopLoss: stopOn ? Number(stop) : null,
        ...(pendingMode
          ? { targetPrice: Number(limit), referencePrice: livePrice }
          : { entryPrice: livePrice }),
      });
      // The server holds the margin now, so reload the wallets for the new balance.
      dispatch(assetsActions.doFetch());
      setConfirmSide(null);
      setNotice(
        `Order Placed Successfully! ${side === "BUY" ? "Buy" : "Sell"} ${pendingMode ? "Pending" : "Market"} · ${quote.symbol}. ` +
          (pendingMode
            ? "Your pending order is waiting for the trigger price."
            : "Your position is now active. Track it in Orders."),
      );
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(""), 4000);
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0]?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function confirm() {
    if (!confirmSide) return;
    if (!isDemo) {
      placeOnServer(confirmSide);
      return;
    }
    try {
      dispatch(
        demoActions.doPlaceOrder({
          side: confirmSide,
          lots,
          leverage,
          limit: pendingMode ? Number(limit) : undefined,
          stop: stopOn ? Number(stop) : undefined,
          take: takeOn ? Number(take) : undefined,
        }),
      );
      setConfirmSide(null);
      setNotice(pendingMode ? "Demo limit order placed." : `Demo ${confirmSide.toLowerCase()} position opened.`);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <aside className="order-ticket">
      <>
        <SwitchTab
          items={ticketTabs}
          value={ticket}
          onChange={(tab) => {
            setTicket(tab);
            setLimit(
              quote.ready ? (isDemo ? quote.price.toFixed(quote.precision) : String(livePrice ?? "")) : "",
            );
          }}
          className="segmented ticket-tabs"
        />
        <div className="ticket-content">
          <h2>{ticket}</h2>
          {pendingMode && (
            <label>
              Limit price
              <input
                aria-label="Limit price"
                type="number"
                min="0"
                step={10 ** -quote.precision}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
              <small>Buy at or below this price; sell at or above.</small>
            </label>
          )}
          <label>
            Multiplier
            <select aria-label="Multiplier" value={leverage} onChange={(e) => setLeverage(+e.target.value)}>
              {(isDemo ? leverages : multipliers).map((value) => (
                <option key={value} value={value}>
                  {value}×
                </option>
              ))}
            </select>
          </label>
          <div className="risk-controls">
            <label>
              <span>
                Set Loss{" "}
                <input
                  type="checkbox"
                  role="switch"
                  checked={stopOn}
                  onChange={(e) => {
                    setStopOn(e.target.checked);
                    if (isDemo ? !stop : e.target.checked) setStop(seed(quote.price * 0.99));
                  }}
                />
              </span>
              <input
                aria-label="Stop loss price"
                type="number"
                step="any"
                disabled={!stopOn}
                value={stop}
                placeholder="0"
                onChange={(e) => setStop(e.target.value)}
              />
            </label>
            <label>
              <span>
                Take Profit{" "}
                <input
                  type="checkbox"
                  role="switch"
                  checked={takeOn}
                  onChange={(e) => {
                    setTakeOn(e.target.checked);
                    if (isDemo ? !take : e.target.checked) setTake(seed(quote.price * 1.01));
                  }}
                />
              </span>
              <input
                aria-label="Take profit price"
                type="number"
                step="any"
                disabled={!takeOn}
                value={take}
                placeholder="0"
                onChange={(e) => setTake(e.target.value)}
              />
            </label>
          </div>
          <label>
            Lots
            <div className="lot-control">
              <button
                aria-label="Decrease lots"
                disabled={lots <= 0.01}
                onClick={() => setLotsInput(Math.max(0.01, lots - 0.01).toFixed(2))}
              >
                <Minus size={18} />
              </button>
              <input
                aria-label="Lots"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={lotsInput}
                onChange={(e) => setLotsInput(e.target.value)}
              />
              <button
                aria-label="Increase lots"
                onClick={() => setLotsInput(Math.min(100, lots + 0.01).toFixed(2))}
              >
                <Plus size={18} />
              </button>
            </div>
          </label>
          <div className="order-summary">
            <div>
              <span>Each Lot</span>
              <b>{isDemo ? quote.contract.toLocaleString() + " units" : "100 " + quote.symbol}</b>
            </div>
            {isDemo || !pendingMode ? (
              <div>
                <span>Estimated Handling Fee</span>
                <b className="numeric">{isDemo ? money(fee || 0) : HANDLING_FEE}</b>
              </div>
            ) : (
              <>
                <div>
                  <span>Current Price</span>
                  <b className="numeric">{livePrice !== null ? livePrice.toFixed(5) : "—"}</b>
                </div>
                <div>
                  <span>Trigger at</span>
                  <b className="numeric">{limit || "0"}</b>
                </div>
              </>
            )}
            <div>
              <span>Estimated Margin</span>
              <b className={"numeric" + (insufficient ? " negative" : "")}>
                {isDemo ? money(margin || 0) : marginText}
              </b>
            </div>
            <div>
              <span>Balance</span>
              <b className="numeric">
                {balanceLoaded ? (isDemo ? money(balance) : "$" + usdt.toFixed(2)) : "—"}
              </b>
            </div>
          </div>
          {blocked && (
            <p role="status" className="ticket-notice">
              {blocked}
            </p>
          )}
          {insufficient && (
            <p role="alert" className="negative ticket-notice">
              ⚠ Insufficient balance. Need {marginText}, you have ${usdt.toFixed(2)}.
            </p>
          )}
          {notice && (
            <p role="status" className="positive ticket-notice">
              <CircleCheck size={16} />
              {notice}
            </p>
          )}
          <small className="simulation-note">
            {isDemo ? "Live market prices · Virtual funds only" : "Live market prices"}
          </small>
        </div>
        <div className="trade-buttons">
          {(["BUY", "SELL"] as Side[]).map((side) => (
            <button
              key={side}
              className={side === "BUY" ? "buy-button" : "sell-button"}
              disabled={!valid}
              onClick={() => {
                setError("");
                setConfirmSide(side);
              }}
            >
              {side === "BUY" ? "Buy" : "Sell"}
              {!isDemo && pendingMode ? " Pending" : ""}
            </button>
          ))}
        </div>
      </>

      {confirmSide && (
        <Modal
          title={
            isDemo
              ? "Confirm demo " + confirmSide.toLowerCase()
              : pendingMode
                ? "Confirm Pending Order"
                : "Confirm Market Order"
          }
          onClose={() => setConfirmSide(null)}
        >
          <p className="order-confirm-note">
            {isDemo
              ? `Practice order using virtual funds, filled at the live ${
                  pendingMode ? "price when it reaches your limit" : confirmSide === "BUY" ? "ask price" : "bid price"
                }.`
              : pendingMode
                ? "This order executes at the live price when it reaches your limit."
                : "This order opens at the live market price."}
          </p>
          <div className="order-confirm">
            <div className="order-confirm-head">
              <div>
                <b>{quote.symbol}</b>
                <small>{quote.name}</small>
              </div>
              <span className={"order-confirm-side " + (confirmSide === "BUY" ? "buy" : "sell")}>
                {confirmSide === "BUY" ? "Buy" : "Sell"}
              </span>
            </div>
            <dl className="order-confirm-rows">
              <div>
                <dt>Order type</dt>
                <dd>{pendingMode ? "Pending" : "Market"}</dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>{lots.toFixed(2)} Lots</dd>
              </div>
              {!isDemo && (
                <div>
                  <dt>Leverage</dt>
                  <dd>{leverage}×</dd>
                </div>
              )}
              {pendingMode ? (
                <>
                  <div>
                    <dt>Trigger price</dt>
                    <dd>{limit || "0"}</dd>
                  </div>
                  {!isDemo && (
                    <div>
                      <dt>Current price</dt>
                      <dd>{livePrice !== null ? livePrice.toFixed(5) : "—"}</dd>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <dt>{isDemo ? "Price now" : "Market price"}</dt>
                  <dd>
                    {isDemo
                      ? (confirmSide === "BUY" ? buyPrice(quote) : sellPrice(quote)).toFixed(quote.precision)
                      : livePrice !== null
                        ? livePrice.toFixed(5)
                        : "—"}
                  </dd>
                </div>
              )}
              {stopOn && stop && (
                <div>
                  <dt>Stop loss</dt>
                  <dd>{stop}</dd>
                </div>
              )}
              {takeOn && take && (
                <div>
                  <dt>Take profit</dt>
                  <dd>{take}</dd>
                </div>
              )}
              {isDemo && (
                <div>
                  <dt>Handling fee</dt>
                  <dd>{money(fee)}</dd>
                </div>
              )}
              <div className="order-confirm-total">
                <dt>Estimated margin</dt>
                <dd>{isDemo ? money(margin) : marginText}</dd>
              </div>
            </dl>
          </div>
          {error && (
            <p role="alert" className="negative">
              {error}
            </p>
          )}
          <div className="order-confirm-actions">
            <button className="order-confirm-cancel" disabled={placing} onClick={() => setConfirmSide(null)}>
              Cancel
            </button>
            <button
              className={confirmSide === "BUY" ? "buy-button" : "sell-button"}
              disabled={placing}
              onClick={confirm}
            >
              {placing ? "Placing…" : "Confirm " + (confirmSide === "BUY" ? "Buy" : "Sell")}
            </button>
          </div>
          {!isDemo && (
            <button
              className="order-confirm-link"
              disabled={placing}
              onClick={() => {
                setConfirmSide(null);
                history.push("/app/orders");
              }}
            >
              View my orders
            </button>
          )}
        </Modal>
      )}
    </aside>
  );
}
