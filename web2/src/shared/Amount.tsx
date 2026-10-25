import type { Quote } from "src/modules/demo/demoEnumerators";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const money = (value: number) => usd.format(value);

export const price = (quote: Quote, value: number = quote.price) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: quote.precision,
    maximumFractionDigits: quote.precision,
  });
