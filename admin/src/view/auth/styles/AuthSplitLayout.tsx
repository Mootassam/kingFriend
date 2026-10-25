import React from 'react';
import styled from 'styled-components';
import { i18n } from 'src/i18n';
import ThemeToggle from 'src/view/layout/ThemeToggle';

// Split-screen layout used by the sign-in and sign-up pages only.
const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);

  @media (max-width: 991px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Brand = styled.aside`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 48px;
  color: #fff;
  background-color: #0f1120;
  background-size: cover;
  background-position: center;
  isolation: isolate;

  /* Tint the tenant image so the copy always reads. */
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -2;
    background:
      radial-gradient(
        900px circle at 0% 0%,
        rgba(129, 140, 248, 0.45),
        transparent 55%
      ),
      radial-gradient(
        700px circle at 100% 100%,
        rgba(236, 72, 153, 0.28),
        transparent 55%
      ),
      linear-gradient(
        160deg,
        rgba(15, 17, 32, 0.82) 0%,
        rgba(30, 27, 75, 0.9) 100%
      );
  }

  /* Faint grid texture. */
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(circle at 30% 40%, #000 0%, transparent 75%);
    -webkit-mask-image: radial-gradient(
      circle at 30% 40%,
      #000 0%,
      transparent 75%
    );
  }

  .brand-logo img {
    max-height: 44px;
    max-width: 200px;
    width: auto;
  }

  .brand-logo span {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .brand-body {
    max-width: 460px;
  }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    margin-bottom: 20px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(6px);
  }

  .brand-pill:before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25);
  }

  .brand-title {
    margin: 0 0 14px;
    font-size: 2.5rem;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.035em;
    color: #fff;
  }

  .brand-text {
    margin: 0 0 32px;
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(226, 229, 240, 0.78);
  }

  .brand-features {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .brand-features li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
  }

  .brand-features i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    font-size: 14px;
    border-radius: var(--radius);
    background: rgba(129, 140, 248, 0.22);
    color: #c7d2fe;
  }

  .brand-footer {
    font-size: 13px;
    color: rgba(226, 229, 240, 0.5);
  }

  @media (max-width: 991px) {
    display: none;
  }
`;

const Panel = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 24px 32px;
  background: var(--surface);

  .panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
  }

  /* Logo only shows on the top bar when the brand panel is hidden. */
  .panel-logo {
    visibility: hidden;
    color: var(--text);
    font-weight: 700;
    font-size: 1.1rem;
  }

  .panel-logo img {
    max-height: 34px;
    width: auto;
  }

  .panel-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
  }

  .panel-card {
    width: 100%;
    max-width: 400px;
  }

  .panel-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 20px;
    font-size: 18px;
    border-radius: var(--radius-lg);
    color: var(--accent-text);
    background: var(--accent-soft);
    border: 1px solid var(--accent-border);
  }

  .panel-title {
    margin: 0 0 6px;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .panel-subtitle {
    margin: 0 0 28px;
    font-size: 15px;
    color: var(--text-muted);
  }

  .panel-footer {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    font-size: 14px;
    text-align: center;
    color: var(--text-muted);
  }

  .panel-footer a {
    margin-left: 4px;
    font-weight: 600;
    color: var(--accent-text);
  }

  .panel-copy {
    font-size: 12px;
    text-align: center;
    color: var(--text-muted);
  }

  .btn-block {
    height: 44px;
    font-weight: 600;
    border-radius: var(--radius);
  }

  .btn-block .spinner-border {
    margin-right: 8px;
  }

  .btn-block i {
    transition: transform 0.15s var(--ease);
  }

  .btn-block:hover:not(:disabled) .fa-arrow-right {
    transform: translateX(3px);
  }

  @media (max-width: 991px) {
    .panel-logo {
      visibility: visible;
    }
  }

  @media (max-width: 575px) {
    padding: 16px;

    .panel-title {
      font-size: 1.5rem;
    }
  }
`;

const FEATURES = [
  { icon: 'fas fa-chart-line', key: 'auth.layout.featureInsights' },
  { icon: 'fas fa-users-cog', key: 'auth.layout.featureUsers' },
  { icon: 'fas fa-shield-alt', key: 'auth.layout.featureSecurity' },
];

function AuthSplitLayout(props: {
  backgroundImageUrl?: string;
  logoUrl?: string;
  icon: string;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const logo = props.logoUrl ? (
    <img src={props.logoUrl} alt={i18n('app.title')} />
  ) : (
    <span>{i18n('app.title')}</span>
  );

  return (
    <Root>
      <Brand
        style={
          props.backgroundImageUrl
            ? { backgroundImage: `url(${props.backgroundImageUrl})` }
            : undefined
        }
      >
        <div className="brand-logo">{logo}</div>

        <div className="brand-body">
          <div className="brand-pill">{i18n('auth.layout.badge')}</div>
          <h1 className="brand-title">{i18n('auth.layout.headline')}</h1>
          <p className="brand-text">{i18n('auth.layout.tagline')}</p>
          <ul className="brand-features">
            {FEATURES.map((feature) => (
              <li key={feature.key}>
                <i className={feature.icon} />
                {i18n(feature.key)}
              </li>
            ))}
          </ul>
        </div>

        <div className="brand-footer">
          © {new Date().getFullYear()} {i18n('app.title')}
        </div>
      </Brand>

      <Panel>
        <div className="panel-top">
          <div className="panel-logo">{logo}</div>
          <ThemeToggle />
        </div>

        <div className="panel-body">
          <div className="panel-card">
            <div className="panel-icon">
              <i className={props.icon} />
            </div>
            <h2 className="panel-title">{props.title}</h2>
            <p className="panel-subtitle">{props.subtitle}</p>

            {props.children}

            {props.footer && (
              <div className="panel-footer">{props.footer}</div>
            )}
          </div>
        </div>

        <div className="panel-copy">
          © {new Date().getFullYear()} {i18n('app.title')}
        </div>
      </Panel>
    </Root>
  );
}

export default AuthSplitLayout;
