import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  Bitcoin,
  ChartNoAxesColumn,
  CircleCheck,
  Coins,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "src/view/shared/Logo";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import MobileNav from "src/view/pages/Landing/MobileNav";
import { cx, sectionLinks } from "src/view/pages/Landing/landingClasses";
import "src/view/shared/styles/css/landing.css";
import "src/view/shared/styles/css/fonts-manrope.css";

// Illustrative figures shown in the landing ticker; not live quotes.
const tickerItems: [string, string, string, boolean][] = [
  ["EUR/USD", "1.08492", "+0.12%", true],
  ["GBP/USD", "1.26794", "+0.08%", true],
  ["USD/JPY", "149.482", "-0.05%", false],
  ["BTC/USD", "67,421", "+1.24%", true],
  ["XAU/USD", "2049.5", "+0.32%", true],
  ["AAPL", "185.40", "+0.54%", true],
];

const features = [
  { icon: Zap, title: "Fast Simulated Execution", text: "Practice placing orders with responsive execution and a clear view of your positions." },
  { icon: Shield, title: "Virtual Funds Only", text: "Explore the platform with a demo balance. No real deposits or brokerage execution." },
  { icon: Globe, title: "Global Markets", text: "Explore Forex, Crypto, Stocks, and Commodities from a single unified platform." },
  { icon: ChartNoAxesColumn, title: "Advanced Charting", text: "Interactive candlestick charts, multiple timeframes and smooth simulated market updates." },
  { icon: TrendingUp, title: "Transparent Trading", text: "Review spreads, estimated margin and handling fees before placing a demo order." },
  { icon: Award, title: "Demo Support", text: "Find platform guidance and explore the support experience in your demo workspace." },
];

const markets = [
  { icon: ArrowLeftRight, title: "Forex", subtitle: "Currency Pairs", text: "Explore major currency pairs and practice your strategies with simulated quotes." },
  { icon: Bitcoin, title: "Cryptocurrencies", subtitle: "Digital Assets", text: "Explore Bitcoin, Ethereum and other digital assets in a virtual trading environment." },
  { icon: TrendingUp, title: "Stocks", subtitle: "Global Equities", text: "Discover shares of leading companies and follow their simulated market movements." },
  { icon: Coins, title: "Commodities", subtitle: "Commodity Markets", text: "Diversify your practice with Gold, Silver and Oil instruments." },
];

const whyPoints = [
  "Practice with virtual funds",
  "Explore multiple asset classes",
  "Monitor positions and account metrics",
  "Review margin before placing orders",
  "Interactive charts on desktop and mobile",
  "Keep your demo progress in this browser",
];

const trust = [
  ["Demo Environment", "No real brokerage execution"],
  ["Virtual Balance", "Practice without real deposits"],
  ["Responsive Execution", "Simulated market and pending orders"],
  ["Mobile Trading", "Explore on desktop or mobile"],
];

const testimonials = [
  ["A clear workspace makes it easy to explore the markets and follow my demo positions.", "James R.", "UK"],
  ["The platform is straightforward to navigate, from quotes to placing a practice order.", "Maria S.", "Spain"],
  ["The charts and account overview make the demo trading experience easy to understand.", "David K.", "Germany"],
];

const contact = [
  { icon: Phone, title: "Demo Support", text: "Explore platform help" },
  { icon: Mail, title: "Contact Us", text: "Support details coming soon" },
  { icon: MapPin, title: "Client Preview", text: "Online demo environment" },
];

const footerColumns: [string, string, string[]][] = [
  ["Trading", "#markets", ["Forex", "Cryptocurrencies", "Stocks", "Commodities"]],
  ["Company", "#why", ["About the Demo", "Demo Information", "Privacy", "Contact"]],
  ["Support", "#contact", ["Platform Help", "Trading Conditions", "Demo Account", "Virtual Funds"]],
];

function CallToActions() {
  return (
    <div className={cx("actions")}>
      <CinematicLink className={cx("primary")} href="/login">
        Start Trading Now <ArrowRight size={18} />
      </CinematicLink>
      <CinematicLink className={cx("secondary")} href="/login">
        Login to Platform
      </CinematicLink>
      <CinematicLink className={cx("demo")} href="/login">
        Try Demo — $10,000 Virtual Funds
      </CinematicLink>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className={cx("landing")}>
      <div className={cx("sticky")}>
        <header className={cx("header")}>
          <Link to="/" aria-label="KingFriend home">
            <Logo />
          </Link>
          <nav aria-label="Main navigation">
            {sectionLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={cx("account")}>
            <CinematicLink className={cx("secondary")} href="/login">
              Login
            </CinematicLink>
            <CinematicLink className={cx("primary")} href="/login">
              Open Account
            </CinematicLink>
          </div>
          <MobileNav />
        </header>
        <div className={cx("ticker")} aria-label="Illustrative demo quotes">
          <div className={cx("tickerTrack")}>
            {[false, true].map((duplicate) =>
              tickerItems.map(([pair, value, change, up]) => (
                <span key={pair + duplicate} aria-hidden={duplicate}>
                  {pair} <b>{value}</b> <strong className={cx(up ? "up" : "down")}>{change}</strong>
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      <section className={cx("hero")}>
        <div className={cx("wrap")}>
          <span className={cx("eyebrow")}>TRADE WITH CONFIDENCE.</span>
          <h1>
            Trade Global Markets
            <br />
            <span>With Confidence</span>
          </h1>
          <p>
            Explore the KingFriend demo trading experience. Professional trading tools, responsive charts, and
            global markets at your fingertips — all with virtual funds.
          </p>
          <CallToActions />
        </div>
      </section>

      <div className={cx("stats")}>
        <div className={cx("wrap")}>
          {[
            ["$10,000", "Starting Virtual Funds"],
            ["4", "Asset Classes"],
            ["7", "Chart Timeframes"],
            ["100%", "Simulated Trading"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="platforms" className={cx("section")}>
        <div className={cx("wrap")}>
          <div className={cx("heading")}>
            <span className={cx("eyebrow")}>PLATFORM FEATURES</span>
            <h2>Everything You Need to Trade</h2>
            <p>
              Our platform combines professional trading tools with an intuitive interface designed for traders of
              all levels.
            </p>
          </div>
          <div className={cx("features")}>
            {features.map((feature) => (
              <article key={feature.title} className={cx("card")}>
                <span className={cx("icon")}>
                  <feature.icon />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="markets" className={cx("alternate")}>
        <div className={cx("wrap")}>
          <div className={cx("heading")}>
            <span className={cx("eyebrow")}>TRADING INSTRUMENTS</span>
            <h2>Global Markets at Your Fingertips</h2>
            <p>Explore instruments across multiple asset classes from one powerful platform.</p>
          </div>
          <div className={cx("markets")}>
            {markets.map((market) => (
              <article key={market.title} className={cx("card")}>
                <market.icon />
                <h3>{market.title}</h3>
                <strong>{market.subtitle}</strong>
                <p>{market.text}</p>
                <Link to="/app/quotes">
                  Trade Now <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className={cx("section")}>
        <div className={cx("why")}>
          <div>
            <span className={cx("eyebrow")}>WHY KingFriend DEMO</span>
            <h2>A Clearer Way to Explore Trading</h2>
            <p>
              Get familiar with the markets in a transparent, professional demo environment before taking your next
              step.
            </p>
            <ul>
              {whyPoints.map((point) => (
                <li key={point}>
                  <CircleCheck />
                  {point}
                </li>
              ))}
            </ul>
            <CinematicLink className={cx("primary")} href="/login">
              Open Demo Account <ArrowRight size={18} />
            </CinematicLink>
          </div>
          <div className={cx("trust")}>
            {trust.map(([title, text]) => (
              <article key={title} className={cx("card")}>
                <span className={cx("icon")}>
                  <span>●</span>
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("alternate")}>
        <div className={cx("wrap")}>
          <div className={cx("heading")}>
            <span className={cx("eyebrow")}>EXAMPLE TESTIMONIALS</span>
            <h2>The Trader Experience</h2>
            <p>Illustrative feedback for this client preview — not verified customer reviews.</p>
          </div>
          <div className={cx("features")}>
            {testimonials.map(([quote, name, country]) => (
              <article key={name} className={cx("testimonial")}>
                <div aria-label="Example five-star rating">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} />
                  ))}
                </div>
                <blockquote>“{quote}”</blockquote>
                <b>{name}</b>
                <p>{country} · Example profile</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("cta")}>
        <h2>Ready to Start Trading?</h2>
        <p>Explore the KingFriend demo platform and start your practice trading journey.</p>
        <CallToActions />
      </section>

      <section id="contact" className={cx("contact")}>
        {contact.map((item) => (
          <div key={item.title}>
            <span className={cx("icon")}>
              <item.icon />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      <footer className={cx("footer")}>
        <div className={cx("wrap")}>
          <div className={cx("footerGrid")}>
            <div>
              <Logo />
              <p>
                KingFriend demo brings global markets and professional trading tools together in a simulated
                environment for client preview.
              </p>
            </div>
            {footerColumns.map(([heading, href, links]) => (
              <div key={heading}>
                <h3>{heading}</h3>
                {links.map((label) => (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className={cx("legal")}>
            <p>
              <b>Demo environment:</b> All prices, orders and balances are simulated. No real funds, payments or
              brokerage execution are supported. Market figures above are illustrative. This client preview is not an
              offer of financial services.
            </p>
            <p>© 2026 KingFriend. All rights reserved. Trade with Confidence.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
