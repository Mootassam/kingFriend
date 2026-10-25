import { Shield, TrendingUp, Zap } from "lucide-react";

const features = [
  [TrendingUp, "Real-time", "market data & charts"],
  [Zap, "Fast simulated", "order execution"],
  [Shield, "Demo balance", "protection"],
] as const;

// Left-hand brand panel shared by the sign-in and register pages.
export default function AuthHero() {
  return (
    <section className="login-intro">
      <span className="login-kicker">TRADE&nbsp;&nbsp; | &nbsp;&nbsp;LEARN&nbsp;&nbsp; | &nbsp;&nbsp;GROW</span>
      <div className="login-hero-content">
        <div className="login-wordmark" role="img" aria-label="KingFriend — Trade with Confidence.">
          <strong>
            King<span>Friend</span>
          </strong>
          <small>TRADE WITH CONFIDENCE.</small>
        </div>
        <p className="login-hero-tagline">Global Markets. Real Opportunities.</p>
        <p className="login-hero-quote">“The best trade is often the one you don't take.”</p>
        <ul className="login-features">
          {features.map(([Icon, first, second]) => (
            <li key={first}>
              <Icon size={33} aria-hidden="true" />
              <span>
                {first}
                <br />
                {second}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <span className="login-market-line">MARKETS&nbsp;&nbsp; CONNECT&nbsp;&nbsp; PEOPLE</span>
    </section>
  );
}
