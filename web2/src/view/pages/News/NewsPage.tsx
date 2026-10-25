import { Bitcoin, ChevronLeft, ChevronRight, ExternalLink, Globe, Newspaper, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NewsService, { NewsArticle, NewsCategory, NewsPage as NewsResult } from "src/modules/news/newsService";
import Errors from "src/modules/shared/error/errors";
import EmptyState from "src/view/shared/EmptyState";
import SearchField from "src/view/shared/SearchField";

const tabs = ["All", "Forex", "Crypto"] as const;
type Tab = (typeof tabs)[number];
const tabCategory: Record<Tab, "all" | NewsCategory> = { All: "all", Forex: "forex", Crypto: "crypto" };
const tabIcons = { All: <Newspaper size={14} />, Forex: <Globe size={14} />, Crypto: <Bitcoin size={14} /> };

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 400;

// "5 min ago", "3 h ago", or a date for older items.
function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Page numbers around the current one, with gaps shown as null: 1 … 4 5 6 … 11
function pageList(page: number, total: number): (number | null)[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

function NewsCard({ article }: { article: NewsArticle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = article.category === "crypto" ? Bitcoin : Globe;

  return (
    <article className="panel news-card">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-image" tabIndex={-1} aria-hidden="true">
        {article.image && !imageFailed ? (
          <img src={article.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
        ) : (
          <span className="news-image-fallback">
            <Icon size={34} />
          </span>
        )}
      </a>
      <div className="news-body">
        <div className="news-meta">
          <span className={"news-tag " + article.category}>{article.category === "crypto" ? "Crypto" : "Forex"}</span>
          <span>{article.source}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt} title={new Date(article.publishedAt).toLocaleString()}>
            {timeAgo(article.publishedAt)}
          </time>
        </div>
        <h2>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h2>
        {article.description && <p>{article.description}</p>}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-read">
          Read on {article.source} <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<NewsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Search after the user stops typing, from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    NewsService.list({ category: tabCategory[tab], page, pageSize: PAGE_SIZE, search: query })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        // The server clamps an out-of-range page; follow it.
        if (data.page !== page) setPage(data.page);
      })
      .catch((err) => {
        if (cancelled) return;
        Errors.handle(err);
        setError(Errors.selectMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, page, query, reload]);

  const goTo = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rows = result?.rows ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <div ref={topRef}>
      <div className="page-title">
        <span className="title-icon">
          <Newspaper />
        </span>
        <div>
          <h1>Market News</h1>
          <small>Latest forex &amp; crypto headlines from trusted sources</small>
        </div>
      </div>
      <div className="news-toolbar">
        <div className="news-tabs" role="tablist" aria-label="News category">
          {tabs.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "selected" : ""}
              onClick={() => {
                setTab(item);
                setPage(1);
              }}
            >
              {tabIcons[item]}
              {item}
            </button>
          ))}
        </div>
        <SearchField compact value={search} onChange={setSearch} label="Search news" placeholder="Search news..." />
        <button className="small-btn news-refresh" disabled={loading} onClick={() => setReload((n) => n + 1)}>
          <RefreshCw size={15} className={loading ? "kc-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="news-page" aria-busy={loading}>
        {result && !error && (
          <p className="news-count" role="status">
            {result.count ? `${result.count} articles · page ${result.page} of ${result.totalPages}` : ""}
          </p>
        )}

        {error ? (
          <EmptyState icon={<TriangleAlert size={30} />} heading="Couldn't load the news" description={error} />
        ) : loading && !result ? (
          <div className="news-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="panel news-card news-skeleton" aria-hidden="true">
                <span className="news-image" />
                <div className="news-body">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length ? (
          <div className={"news-grid" + (loading ? " is-loading" : "")}>
            {rows.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Newspaper size={30} />}
            heading="No news found"
            description={query ? `Nothing matches "${query}". Try another word.` : "No articles right now. Try again in a few minutes."}
          />
        )}

        {error && (
          <div className="news-retry">
            <button className="primary small" onClick={() => setReload((n) => n + 1)}>
              Try again
            </button>
          </div>
        )}

        {!error && totalPages > 1 && (
          <nav className="news-pagination" aria-label="News pages">
            <button disabled={page <= 1 || loading} onClick={() => goTo(page - 1)} aria-label="Previous page">
              <ChevronLeft size={16} /> Prev
            </button>
            {pageList(page, totalPages).map((p, i) =>
              p === null ? (
                <span key={"gap" + i} className="news-gap">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={p === page ? "selected" : ""}
                  aria-current={p === page ? "page" : undefined}
                  disabled={loading}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button disabled={page >= totalPages || loading} onClick={() => goTo(page + 1)} aria-label="Next page">
              Next <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
