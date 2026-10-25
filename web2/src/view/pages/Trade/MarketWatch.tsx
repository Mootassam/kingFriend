import { SearchX } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import { filterQuotes } from "src/modules/demo/demoEngine";
import { CategoryFilter, categories, watchOrder } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import AnimatedPrice from "src/view/shared/AnimatedPrice";
import Change from "src/view/shared/Change";
import EmptyState from "src/view/shared/EmptyState";
import SearchField from "src/view/shared/SearchField";
import SwitchTab from "src/view/shared/SwitchTab";

export default function MarketWatch() {
  const dispatch = useDispatch();
  const quotes = useSelector(demoSelectors.selectQuotes);
  const selected = useSelector(demoSelectors.selectRaw).selectedSymbol;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const rows = filterQuotes(quotes, search, category).sort(
    (a, b) => watchOrder.indexOf(a.symbol) - watchOrder.indexOf(b.symbol),
  );

  return (
    <aside className="market-watch">
      <div className="watch-header">
        <h2>MARKET WATCH</h2>
        <SearchField compact value={search} onChange={setSearch} />
        <SwitchTab items={categories} value={category} onChange={setCategory} />
      </div>
      <div className="watch-columns">
        <span>Symbol</span>
        <span>Bid</span>
        <span>Chg%</span>
      </div>
      <div className="watch-list">
        {rows.map((quote) => (
          <button
            key={quote.symbol}
            onClick={() => dispatch(demoActions.doSelectSymbol(quote.symbol))}
            className={"watch-row " + (selected === quote.symbol ? "selected" : "")}
          >
            <span>
              <b>{quote.symbol}</b>
              <small>{quote.open === false ? "CLOSED" : quote.category.toUpperCase()}</small>
            </span>
            <span className="numeric">{quote.ready ? <AnimatedPrice quote={quote} value={quote.bid > 0 ? quote.bid : quote.price} /> : "—"}</span>
            {quote.ready ? <Change value={quote.change} /> : <span className="numeric">—</span>}
          </button>
        ))}
        {!rows.length && <EmptyState icon={<SearchX />} heading="No results" />}
      </div>
      <div className="watch-footer">
        <span>{rows.length} instruments</span>
      </div>
    </aside>
  );
}
