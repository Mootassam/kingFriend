import React, { useEffect, useRef, useState } from 'react';
import NewsService, { NewsArticle, NewsCategory, NewsPage } from 'src/modules/news/newsService';
import Errors from 'src/modules/shared/error/errors';

const tabs = ['All', 'Forex', 'Crypto'] as const;
type Tab = (typeof tabs)[number];
const tabCategory: Record<Tab, 'all' | NewsCategory> = { All: 'all', Forex: 'forex', Crypto: 'crypto' };
const tabIcons: Record<Tab, string> = { All: 'fas fa-newspaper', Forex: 'fas fa-globe', Crypto: 'fab fa-bitcoin' };

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 400;

// "5 min ago", "3 h ago", or a date for older items.
function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Page numbers around the current one, with gaps shown as null: 1 … 4 5 6 … 11
function pageList(page: number, total: number): (number | null)[] {
  const pages = Array.from(new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total)));
  const sorted = pages.sort((a, b) => a - b);
  return sorted.reduce<(number | null)[]>(
    (list, p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [...list, null, p] : [...list, p]),
    [],
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const crypto = article.category === 'crypto';

  return (
    <article className="news-card">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="news-img-container"
        tabIndex={-1}
        aria-hidden="true"
      >
        {article.image && !imageFailed ? (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="news-img-fallback">
            <i className={crypto ? 'fab fa-bitcoin' : 'fas fa-globe'} />
          </span>
        )}
      </a>
      <div className="news-card-body">
        <div className="news-meta">
          <span className={'news-tag ' + article.category}>{crypto ? 'Crypto' : 'Forex'}</span>
          <span>{article.source}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt} title={new Date(article.publishedAt).toLocaleString()}>
            {timeAgo(article.publishedAt)}
          </time>
        </div>
        <h4 className="news-title">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h4>
        {article.description && <p className="news-desc">{article.description}</p>}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-read">
          Read on {article.source} <i className="fas fa-external-link-alt" />
        </a>
      </div>
    </article>
  );
}

function Home() {
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<NewsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setError('');
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
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const rows = result?.rows ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="home-container">
      <div className="header" />

      <div className="content-card" ref={topRef}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Market News</h3>
            <small className="section-subtitle">Latest forex &amp; crypto headlines from trusted sources</small>
          </div>
          <button
            className="news-refresh"
            disabled={loading}
            onClick={() => setReload((n) => n + 1)}
            aria-label="Refresh news"
          >
            <i className={'fas fa-sync-alt' + (loading ? ' fa-spin' : '')} />
          </button>
        </div>

        <div className="news-tabs" role="tablist" aria-label="News category">
          {tabs.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? 'selected' : ''}
              onClick={() => {
                setTab(item);
                setPage(1);
              }}
            >
              <i className={tabIcons[item]} /> {item}
            </button>
          ))}
        </div>

        <label className="news-search">
          <i className="fas fa-search" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news..."
            aria-label="Search news"
          />
        </label>

        <div aria-busy={loading}>
          {result && !error && result.count > 0 && (
            <p className="news-count" role="status">
              {result.count} articles · page {result.page} of {result.totalPages}
            </p>
          )}

          {error ? (
            <div className="error-box">
              <i className="fas fa-exclamation-circle" />
              <b>Couldn't load the news</b>
              <span>{error}</span>
              <button onClick={() => setReload((n) => n + 1)} className="retry-btn">
                Try again
              </button>
            </div>
          ) : loading && !result ? (
            <div className="news-grid">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="news-card skeleton" aria-hidden="true">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line long" />
                    <div className="skeleton-line medium" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length ? (
            <div className={'news-grid' + (loading ? ' is-loading' : '')}>
              {rows.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="news-empty">
              <i className="fas fa-newspaper" />
              <b>No news found</b>
              <span>
                {query ? `Nothing matches "${query}". Try another word.` : 'No articles right now. Try again in a few minutes.'}
              </span>
            </div>
          )}

          {!error && totalPages > 1 && (
            <nav className="news-pagination" aria-label="News pages">
              <button disabled={page <= 1 || loading} onClick={() => goTo(page - 1)} aria-label="Previous page">
                <i className="fas fa-chevron-left" />
              </button>
              {pageList(page, totalPages).map((p, i) =>
                p === null ? (
                  <span key={'gap' + i} className="news-gap">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={p === page ? 'selected' : ''}
                    aria-current={p === page ? 'page' : undefined}
                    disabled={loading}
                    onClick={() => goTo(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button disabled={page >= totalPages || loading} onClick={() => goTo(page + 1)} aria-label="Next page">
                <i className="fas fa-chevron-right" />
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        body {
          background-color: var(--kt-bg-card-alt);
        }
        .home-container {
          max-width: 400px;
          margin: 0 auto;
          min-height: 100vh;
          background: linear-gradient(135deg, #106cf5 0%, #0a4fc4 100%);
          position: relative;
        }

        .header {
          padding: 30px 20px 20px;
        }

        /* White content card – matches LoginPassword / MarketDetail */
        .content-card {
          background: var(--kt-bg-card);
          border-radius: 40px 40px 0 0;
          padding: 25px 20px 60px;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
          min-height: calc(100vh - 100px);
          scroll-margin-top: 10px;
        }

        /* Section header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--kt-text-primary);
        }
        .section-subtitle {
          display: block;
          margin-top: 3px;
          font-size: 12px;
          color: var(--kt-text-muted);
        }
        .news-refresh {
          flex: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--kt-border);
          background: var(--kt-bg-card);
          color: #106cf5;
          cursor: pointer;
        }
        .news-refresh:disabled {
          opacity: 0.6;
          cursor: default;
        }

        /* Category tabs */
        .news-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 4px;
          margin-bottom: 12px;
          border-radius: 12px;
          background: var(--kt-bg-card-alt);
          border: 1px solid var(--kt-border);
        }
        .news-tabs button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: var(--kt-text-tertiary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .news-tabs button.selected {
          background: #106cf5;
          color: #fff;
          box-shadow: 0 2px 8px rgba(16,108,245,0.3);
        }

        /* Search */
        .news-search {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 12px;
          margin-bottom: 12px;
          border-radius: 10px;
          border: 1px solid var(--kt-border);
          background: var(--kt-bg-card);
          color: var(--kt-text-muted);
        }
        .news-search:focus-within {
          border-color: #106cf5;
        }
        .news-search input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: var(--kt-text-primary);
          font-size: 14px;
        }
        .news-count {
          margin-bottom: 10px;
          font-size: 12px;
          color: var(--kt-text-muted);
        }

        /* News list */
        .news-grid {
          display: grid;
          gap: 12px;
          transition: opacity 0.2s;
        }
        .news-grid.is-loading {
          opacity: 0.55;
        }
        .news-card {
          background: var(--kt-bg-card);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--kt-border);
          color: var(--kt-text-secondary);
          transition: 0.2s;
          display: flex;
          flex-direction: column;
        }
        .news-card:hover {
          border-color: #106cf5;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .news-img-container {
          display: block;
          width: 100%;
          height: 150px;
          overflow: hidden;
          background: var(--kt-bg-card-alt);
        }
        .news-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .news-img-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 34px;
          color: #106cf5;
          opacity: 0.6;
        }
        .news-card-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .news-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--kt-text-muted);
        }
        .news-tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #fff;
          background: #106cf5;
        }
        .news-tag.crypto {
          background: #f59e0b;
        }
        .news-title {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
        }
        .news-title a {
          color: var(--kt-text-primary);
          text-decoration: none;
        }
        .news-title a:hover {
          color: #106cf5;
        }
        .news-desc {
          font-size: 12px;
          color: var(--kt-text-tertiary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .news-read {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #106cf5;
          text-decoration: none;
        }
        .news-read i {
          font-size: 10px;
        }

        /* Pagination */
        .news-pagination {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 18px;
        }
        .news-pagination button {
          min-width: 34px;
          height: 34px;
          padding: 0 8px;
          border-radius: 9px;
          border: 1px solid var(--kt-border);
          background: var(--kt-bg-card);
          color: var(--kt-text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .news-pagination button.selected {
          background: #106cf5;
          border-color: #106cf5;
          color: #fff;
        }
        .news-pagination button:disabled:not(.selected) {
          opacity: 0.45;
          cursor: default;
        }
        .news-gap {
          color: var(--kt-text-muted);
        }

        /* Skeletons */
        .skeleton .skeleton-img {
          height: 150px;
          background: linear-gradient(90deg, var(--kt-bg-card-alt) 25%, var(--kt-border) 50%, var(--kt-bg-card-alt) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .skeleton-body {
          padding: 12px;
        }
        .skeleton-line {
          background: linear-gradient(90deg, var(--kt-bg-card-alt) 25%, var(--kt-border) 50%, var(--kt-bg-card-alt) 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: shimmer 1.4s infinite;
        }
        .skeleton-line.short { height: 12px; width: 40%; }
        .skeleton-line.long { height: 14px; width: 90%; }
        .skeleton-line.medium { height: 12px; width: 60%; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Error and empty states */
        .error-box,
        .news-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 28px 20px;
          border-radius: 12px;
          text-align: center;
          font-size: 13px;
        }
        .error-box {
          background: #fff5f5;
          border: 1px solid #ffcccc;
          color: #f56c6c;
        }
        .news-empty {
          border: 1px dashed var(--kt-border);
          color: var(--kt-text-muted);
        }
        .error-box i,
        .news-empty i {
          font-size: 26px;
          margin-bottom: 4px;
        }
        .error-box b,
        .news-empty b {
          font-size: 15px;
        }
        .news-empty b {
          color: var(--kt-text-primary);
        }
        .retry-btn {
          background: #106cf5;
          color: white;
          border: none;
          margin-top: 8px;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Mobile tweaks */
        @media (max-width: 380px) {
          .content-card {
            padding: 20px 16px 60px;
          }
          .news-img-container,
          .skeleton .skeleton-img {
            height: 130px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
