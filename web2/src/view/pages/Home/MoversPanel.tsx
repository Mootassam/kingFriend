import { TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { Quote } from "src/modules/demo/demoEnumerators";
import { price } from "src/shared/Amount";
import Change from "src/view/shared/Change";

export default function MoversPanel({ data, down = false }: { data: Quote[]; down?: boolean }) {
  return (
    <section className="panel movers">
      <header>
        <b className={down ? "negative" : "positive"}>
          {down ? <TrendingDown size={19} /> : <TrendingUp size={19} />} TOP {down ? "LOSERS" : "GAINERS"}
        </b>
        <small>24h change</small>
      </header>
      {data.map((quote, index) => (
        <Link key={quote.symbol} to={"/app/trade?symbol=" + quote.symbol} className="mover-row">
          <small>#{index + 1}</small>
          <div>
            <b>{quote.symbol}</b>
            <small>{quote.name}</small>
          </div>
          <div className="right">
            <b className="numeric">{price(quote)}</b>
            <small>
              <Change value={quote.change} />
            </small>
          </div>
        </Link>
      ))}
    </section>
  );
}
