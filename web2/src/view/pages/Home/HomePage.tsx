import { Activity, ChartNoAxesColumn, Wallet, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import accountSelectors from "src/modules/account/accountSelectors";
import assetsSelectors from "src/modules/assets/assetsSelectors";
import authSelectors from "src/modules/auth/authSelectors";
import demoSelectors from "src/modules/demo/demoSelectors";
import { money } from "src/shared/Amount";
import AccountActions from "src/view/shared/AccountActions";
import MoversPanel from "src/view/pages/Home/MoversPanel";
import useAccountStats from "src/view/pages/Home/useAccountStats";

const greeting = (hour: number) => (hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening");

export default function HomePage() {
  const name = useSelector(authSelectors.selectDisplayName);
  const user = useSelector(authSelectors.selectCurrentUser);
  const isDemo = useSelector(authSelectors.selectIsDemo);
  const balance = useSelector(accountSelectors.selectBalance);
  const balanceLoaded = useSelector(accountSelectors.selectBalanceLoaded);
  const balanceError = useSelector(assetsSelectors.selectErrorMessage);
  const quotes = useSelector(demoSelectors.selectQuotes);
  const stats = useAccountStats();
  const now = new Date();
  // Movers only from instruments the live feed has priced.
  const sorted = quotes.filter((q) => q.ready).sort((a, b) => b.change - a.change);
  // The balance can be zero on a real account, which would turn the percentage into NaN.
  const todayPercent = balance > 0 ? (stats.today / balance) * 100 : 0;
  // Shown as "—" until the server's wallets arrive, so a stale number is never displayed.
  const balanceLabel = balanceLoaded ? money(balance) : balanceError ? "—" : "Loading…";

  return (
    <div className="home-page">
      <div className="greeting">
        <div>
          <h1>
            Good {greeting(now.getHours())}, <span>{name}</span> <span className="wave">👋</span>
          </h1>
          <p>
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{" "}
            {isDemo && <span className="demo-badge">DEMO ACCOUNT</span>}
          </p>
          {user?.uid && (
            <span className="uid">
              UID <b className="numeric">{user.uid}</b>
            </span>
          )}
        </div>
        <Link to="/app/profile" className="avatar">
          {name.charAt(0).toUpperCase()}
        </Link>
      </div>

      <section className="balance-card">
        <div className="eyebrow">
          <Wallet size={18} /> ACCOUNT BALANCE
        </div>
        <div className="big-balance numeric">{balanceLabel}</div>
        {!isDemo && balanceError && (
          <p className="negative" role="alert">
            Couldn&apos;t load your balance: {balanceError}
          </p>
        )}
        <div className={"pnl-strip " + (stats.today >= 0 ? "profit" : "loss")}>
          <span>
            <Activity size={18} /> TODAY’S P&amp;L
          </span>
          <b className="numeric">
            {money(stats.today)} ({todayPercent.toFixed(2)}%)
          </b>
        </div>
        <div className="metrics">
          <div>
            <small>TOTAL EQUITY</small>
            <b className="numeric">{balanceLoaded ? money(stats.equity) : "—"}</b>
          </div>
          <div>
            <small>AVAILABLE MARGIN</small>
            <b className="numeric positive">{balanceLoaded ? money(stats.available) : "—"}</b>
          </div>
          <div>
            <small>MARGIN USED</small>
            <b className="numeric amber">{money(stats.margin)}</b>
          </div>
        </div>
      </section>

      <h2 className="section-label">
        <Activity size={18} /> QUICK ACCESS
      </h2>
      <AccountActions />

      <h2 className="section-label">
        <ChartNoAxesColumn size={18} /> MARKET MOVERS
      </h2>
      <div className="movers-grid">
        <MoversPanel data={sorted.slice(0, 5)} />
        <MoversPanel data={sorted.filter((q) => q.change < 0).reverse().slice(0, 5)} down />
      </div>

      <section className="ready-card">
        <span className="ready-icon">
          <Zap />
        </span>
        <div>
          <h3>Ready to Trade?</h3>
          <p>Access advanced charts, demo order execution and global market simulations.</p>
          <Link className="primary" to="/app/trade">
            <ChartNoAxesColumn size={18} /> Open Chart &amp; Trade
          </Link>
        </div>
      </section>
    </div>
  );
}
