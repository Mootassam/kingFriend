import { Bitcoin, ChartNoAxesColumn, Globe, Layers, Moon, SearchX } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { filterQuotes } from "src/modules/demo/demoEngine";
import { CategoryFilter, categories } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import AnimatedPrice from "src/view/shared/AnimatedPrice";
import Change from "src/view/shared/Change";
import EmptyState from "src/view/shared/EmptyState";
import SearchField from "src/view/shared/SearchField";
import SwitchTab from "src/view/shared/SwitchTab";

const tabIcons = {
  Forex: <Globe size={14} />,
  Crypto: <Bitcoin size={14} />,
  Commodities: <Layers size={14} />,
  Indices: <ChartNoAxesColumn size={14} />,
};

export default function MarketPage() {
  const quotes = useSelector(demoSelectors.selectQuotes);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const visible = filterQuotes(quotes, search, category);

  return (
    <div>
      <div className="markets-head">
        <div className="heading-row">
          <h1>Markets</h1>
          <span className="pill">{visible.length} instruments</span>
        </div>
        <SearchField value={search} onChange={setSearch} />
        <SwitchTab items={categories} value={category} onChange={setCategory} className="chips" icons={tabIcons} />
      </div>
      <div className="page-padding">
        {categories.slice(1).map((group) => {
          const rows = visible.filter((quote) => quote.category === group);
          if (!rows.length) return null;
          return (
            <section key={group} className="market-section">
              <h2>
                <Globe size={20} />
                {group.toUpperCase()} <span className="pill">{rows.length}</span>
                {group === "Forex" && <small className="featured">Featured</small>}
              </h2>
              <div className="market-table panel">
                <div className="market-table-head">
                  <span>SYMBOL</span>
                  <span>PRICE &nbsp; 24H</span>
                </div>
                {rows.map((quote) => {
                  const closed = quote.open === false;
                  return (
                    <div key={quote.symbol} className={"quote-row" + (closed ? " is-closed" : "")}>
                      <div>
                        <b>
                          {quote.symbol}
                          {closed && (
                            <span className="market-closed" title="Market closed. Showing the last price until it reopens.">
                              <Moon size={11} aria-hidden="true" /> Closed
                            </span>
                          )}
                        </b>
                        <small>{quote.name}</small>
                      </div>
                      <strong className="numeric quote-price">{quote.ready ? <AnimatedPrice quote={quote} /> : "—"}</strong>
                      {quote.ready ? <Change value={quote.change} /> : <span className="numeric">—</span>}
                      <Link className="primary small" to={"/app/trade?symbol=" + quote.symbol}>
                        Trade
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {!visible.length && (
          <EmptyState
            icon={<SearchX />}
            heading="No instruments found"
            description="Try another symbol or market category."
          />
        )}
      </div>
    </div>
  );
}
