import { useLayoutEffect, useRef } from "react";
import type { Quote } from "src/modules/demo/demoEnumerators";
import { price } from "src/shared/Amount";

const DURATION_MS = 400;

// Eases the displayed number toward the new value instead of jumping.
export default function AnimatedPrice({ quote, value = quote.price }: { quote: Quote; value?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef({ symbol: quote.symbol, value });

  useLayoutEffect(() => {
    const from = last.current.symbol === quote.symbol ? last.current.value : value;
    const start = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (ref.current) ref.current.textContent = price(quote, from);

    let frame = 0;
    const step = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / DURATION_MS);
      const current = from + (value - from) * (1 - Math.pow(1 - t, 3));
      last.current = { symbol: quote.symbol, value: current };
      if (ref.current) ref.current.textContent = price(quote, current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, quote]);

  return <span ref={ref}>{price(quote, value)}</span>;
}
