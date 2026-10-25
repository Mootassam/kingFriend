import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { Quote, Timeframe, timeframeResolution, timeframeSeconds } from "src/modules/demo/demoEnumerators";
import { FeedCandle, subscribeCandles } from "src/modules/market/chartFeedService";
import { buildInjectionSeries } from "src/modules/market/injectionSeries";
import type { SymbolInjection } from "src/modules/tradeOrders/tradeOrdersService";
import { useTheme } from "src/modules/theme/themeContext";

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

const UP = "#21a66b";
const DOWN = "#ea393f";
const VOLUME_UP = "#174835";
const VOLUME_DOWN = "#51272e";

const palette = (light: boolean) => ({
  layout: {
    background: { type: ColorType.Solid, color: light ? "#ffffff" : "#111621" },
    textColor: light ? "#52627b" : "#7e879a",
    panes: { separatorColor: light ? "#d7e0ec" : "#263044" },
  },
  grid: {
    vertLines: { color: light ? "#e4eaf2" : "#212a3a" },
    horzLines: { color: light ? "#e4eaf2" : "#212a3a" },
  },
  rightPriceScale: { borderColor: light ? "#d7e0ec" : "#263249" },
  timeScale: { borderColor: light ? "#d7e0ec" : "#263249" },
});

interface Props {
  quote: Quote;
  timeframe: Timeframe;
  onOhlc: (candle: Candle) => void;
  // Admin price injection for this symbol: while it runs the chart draws PC's deterministic
  // injection candles instead of the feed, then returns to live candles when it ends.
  injection?: SymbolInjection | null;
}

const INJECTION_TICK_MS = 1000;

const toCandle = (c: FeedCandle): Candle => ({
  time: c.time as UTCTimestamp,
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
});

const toVolume = (c: FeedCandle) => ({
  time: c.time as UTCTimestamp,
  value: c.volume,
  color: c.close >= c.open ? VOLUME_UP : VOLUME_DOWN,
});

// Real market candles from the live feed: history first, then the latest bar updates live.
export default function CandleChart({ quote, timeframe, onOhlc, injection }: Props) {
  const { light } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const active = injection && injection.symbol === quote.symbol ? injection : null;
  const injectionRef = useRef(active);
  injectionRef.current = active;

  // Rebuild the chart whenever the instrument or timeframe changes.
  useEffect(() => {
    if (!container.current) return;
    setStatus("loading");
    const api = createChart(container.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#111621" },
        textColor: "#7e879a",
        fontFamily: "Courier New",
        fontSize: 12,
        attributionLogo: false,
        panes: { separatorColor: "#263044", separatorHoverColor: "#344058" },
      },
      grid: { vertLines: { color: "#212a3a" }, horzLines: { color: "#212a3a" } },
      rightPriceScale: {
        borderColor: "#263249",
        scaleMargins: { top: 0.08, bottom: 0.08 },
        minimumWidth: 86,
      },
      timeScale: { borderColor: "#263249", timeVisible: true, secondsVisible: false, barSpacing: 10 },
      crosshair: { vertLine: { color: "#8098bb" }, horzLine: { color: "#8098bb" } },
    });
    api.applyOptions(palette(light));

    const series = api.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceFormat: { type: "price", precision: quote.precision, minMove: 10 ** -quote.precision },
      priceLineColor: "#eeb900",
      priceLineStyle: LineStyle.Dashed,
    });
    const bars: ISeriesApi<"Histogram"> = api.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" }, priceScaleId: "volume", lastValueVisible: false, priceLineVisible: false },
      1,
    );
    bars.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0 }, visible: false });
    api.panes()[0].setStretchFactor(0.93);
    api.panes()[1].setStretchFactor(0.07);
    chart.current = api;

    const running = injectionRef.current;
    if (running) {
      const bucket = timeframeSeconds[timeframe];
      const draw = () => {
        const candles = buildInjectionSeries(running, bucket, Date.now()).map((c) => ({
          ...c,
          time: c.time as UTCTimestamp,
        }));
        series.setData(candles);
        onOhlc(candles[candles.length - 1]);
      };
      bars.setData([]);
      draw();
      api.timeScale().scrollToPosition(5, false);
      setStatus("ready");
      const tick = setInterval(draw, INJECTION_TICK_MS);
      return () => {
        clearInterval(tick);
        chart.current = null;
        api.remove();
      };
    }

    let last: FeedCandle | null = null;
    const stop = subscribeCandles(quote.symbol, timeframeResolution[timeframe], {
      onHistory: (candles) => {
        series.setData(candles.map(toCandle));
        bars.setData(candles.map(toVolume));
        api.timeScale().setVisibleLogicalRange({ from: candles.length - 60, to: candles.length + 1 });
        last = candles[candles.length - 1];
        onOhlc(toCandle(last));
        setStatus("ready");
      },
      onUpdate: (candle) => {
        // Ignore late updates for bars older than the one already shown.
        if (last && candle.time < last.time) return;
        series.update(toCandle(candle));
        bars.update(toVolume(candle));
        last = candle;
        onOhlc(toCandle(candle));
      },
      onError: (message) => {
        setError(message);
        setStatus("error");
      },
    });

    return () => {
      stop();
      chart.current = null;
      api.remove();
    };
    // onOhlc is a state setter from the parent and never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.symbol, quote.precision, timeframe, active?.startedAt, active?.targetPrice, active?.durationMs]);

  useEffect(() => {
    chart.current?.applyOptions(palette(light));
  }, [light, quote.symbol, timeframe]);

  return (
    <div className="candle-chart-wrap">
      <div ref={container} className="candle-chart" aria-label={`Live ${quote.symbol} candlestick chart`} />
      {status !== "ready" && (
        <div className="chart-status" role="status">
          {status === "loading" ? "Loading live chart…" : error}
        </div>
      )}
    </div>
  );
}
