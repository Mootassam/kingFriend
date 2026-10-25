import { Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import demoActions from "src/modules/demo/demoActions";
import { Timeframe, timeframes } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import { injectionPrice } from "src/modules/tradeOrders/tradeOrdersService";
import useSymbolInjections from "src/modules/tradeOrders/useSymbolInjections";
import { price } from "src/shared/Amount";
import AnimatedPrice from "src/view/shared/AnimatedPrice";
import Change from "src/view/shared/Change";
import SwitchTab from "src/view/shared/SwitchTab";
import CandleChart, { Candle } from "src/view/pages/Trade/CandleChart";
import MarketWatch from "src/view/pages/Trade/MarketWatch";
import OrderTicket from "src/view/pages/Trade/OrderTicket";

const mobileTabs = ["Markets", "Chart", "Order"] as const;

export default function TradePage() {
  const dispatch = useDispatch();
  const symbol = new URLSearchParams(useLocation().search).get("symbol");
  const quote = useSelector(demoSelectors.selectSelectedQuote);
  const [timeframe, setTimeframe] = useState<Timeframe>("D1");
  const [mobileTab, setMobileTab] = useState<(typeof mobileTabs)[number]>("Chart");
  const [ohlc, setOhlc] = useState<Candle | null>(null);
  // Server-driven chart injections (same for every visitor, as on PC's futures page).
  const injection = useSymbolInjections()[quote.symbol] ?? null;
  // 1 s ticker so the injected header price moves smoothly, like PC.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!injection) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [injection]);
  const headerPrice = injection ? injectionPrice(injection) : quote.price;

  useEffect(() => {
    if (symbol) dispatch(demoActions.doSelectSymbol(symbol));
  }, [symbol, dispatch]);

  // A new instrument or timeframe starts without OHLC until its candles load.
  useEffect(() => setOhlc(null), [quote.symbol, timeframe]);

  // Real bid/ask from the feed; instruments without them (some indices) show the last price.
  const bid = quote.bid > 0 ? quote.bid : quote.price;
  const ask = quote.ask > 0 ? quote.ask : quote.price;
  const spread = Math.max(0, ask - bid);
  const ready = quote.ready;

  return (
    <div className={"terminal mobile-" + mobileTab.toLowerCase()}>
      <SwitchTab items={mobileTabs} value={mobileTab} onChange={setMobileTab} className="terminal-mobile-tabs" />
      <MarketWatch />
      <section className="chart-panel">
        <div className="chart-heading">
          <div className="instrument-line">
            <h1>{quote.symbol}</h1>
            <span className="asset-tag">{quote.category}</span>
            {quote.open === false && (
              <span className="market-closed" title="Market closed. Trading resumes when it reopens.">
                <Moon size={11} aria-hidden="true" /> Closed
              </span>
            )}
            <b className="numeric">{ready ? <AnimatedPrice quote={quote} value={headerPrice} /> : "—"}</b>
            {ready && <Change value={quote.change} />}
          </div>
          {/* O/H/L/C on the left and timeframes on the right of the same row. */}
          <div className="chart-subline">
            <div className="ohlc">
              <span>
                O <b>{ohlc ? price(quote, ohlc.open) : "—"}</b>
              </span>
              <span>
                H <b>{ohlc ? price(quote, ohlc.high) : "—"}</b>
              </span>
              <span>
                L <b>{ohlc ? price(quote, ohlc.low) : "—"}</b>
              </span>
              <span>
                C <b>{ohlc ? price(quote, ohlc.close) : "—"}</b>
              </span>
            </div>
            <SwitchTab items={timeframes} value={timeframe} onChange={setTimeframe} className="timeframes" />
          </div>
        </div>
        <div className="bid-ask">
          <div>
            <small>BID</small>
            <b className="numeric negative">{ready ? <AnimatedPrice quote={quote} value={bid} /> : "—"}</b>
          </div>
          <div>
            <small>ASK</small>
            <b className="numeric positive">{ready ? <AnimatedPrice quote={quote} value={ask} /> : "—"}</b>
          </div>
          <div>
            <small>SPREAD</small>
            <b className="numeric">{ready ? spread.toFixed(quote.precision) : "—"}</b>
          </div>
          <small className="chart-hint">
            <span className="amber">{timeframe}</span> · Scroll/drag to zoom &amp; pan
          </small>
        </div>
        <CandleChart quote={quote} timeframe={timeframe} onOhlc={setOhlc} injection={injection} />
      </section>
      <OrderTicket key={quote.symbol} quote={quote} />
    </div>
  );
}
