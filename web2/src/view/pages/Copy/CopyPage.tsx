import { Award, Rocket, Users } from "lucide-react";

export default function CopyPage() {
  return (
    <div>
      <div className="page-title">
        <div>
          <h1>
            <Users /> Copy Trading
          </h1>
          <p>Follow top demo traders and mirror their simulated strategies.</p>
        </div>
      </div>
      <div className="copy-stats">
        <div>
          <strong>0</strong>
          <small>Active Traders</small>
        </div>
        <div>
          <strong>—</strong>
          <small>Avg. Monthly Return</small>
        </div>
        <div>
          <Rocket />
          <small>Coming Soon</small>
        </div>
      </div>
      <div className="provider-title">
        <Award />
        <b>TOP SIGNAL PROVIDERS</b>
        <span className="pill">Demo feature</span>
      </div>
    </div>
  );
}
