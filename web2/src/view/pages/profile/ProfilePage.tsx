import {
  BadgeCheck,
  CalendarDays,
  Copy,
  Gift,
  Hash,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  TriangleAlert,
  User,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import assetsActions from "src/modules/assets/assetsActions";
import assetsSelectors from "src/modules/assets/assetsSelectors";
import AssetsService from "src/modules/assets/assetsService";
import authActions from "src/modules/auth/authActions";
import authSelectors from "src/modules/auth/authSelectors";
import kycActions from "src/modules/kyc/kycActions";
import kycSelectors from "src/modules/kyc/kycSelectors";
import type { AppDispatch } from "src/modules/store";
import { money } from "src/shared/Amount";
import AccountActions from "src/view/shared/AccountActions";
import DemoBadge from "src/view/shared/DemoBadge";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import KycModal from "src/view/shared/kyc/KycModal";
import Modal from "src/view/shared/modals/Modal";
import ChangePasswordModal from "src/view/pages/profile/ChangePasswordModal";

const kycLabels = {
  success: "Verified",
  pending: "Under review",
  unverified: "Not verified",
};

const coinAmount = (value: number) =>
  (Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const memberSince = (date?: string) => {
  const parsed = date ? new Date(date) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

interface Row {
  label: string;
  value: string;
  icon: typeof User;
  action?: ReactNode;
}

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(authSelectors.selectCurrentUser)!;
  const name = useSelector(authSelectors.selectDisplayName);
  const isDemo = useSelector(authSelectors.selectIsDemo);
  const wallets = useSelector(assetsSelectors.selectRows);
  const total = useSelector(assetsSelectors.selectTotalUsd);
  const assetsLoaded = useSelector(assetsSelectors.selectLoaded);
  const assetsLoading = useSelector(assetsSelectors.selectLoading);
  const assetsError = useSelector(assetsSelectors.selectErrorMessage);
  const kycStatus = useSelector(kycSelectors.selectKycStatus);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [kycOpen, setKycOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const refresh = () => {
    dispatch(authActions.doRefreshCurrentUser());
    dispatch(assetsActions.doFetch());
    if (!isDemo) dispatch(kycActions.doFetch());
  };

  useEffect(refresh, [dispatch, isDemo]);

  const copyButton = (label: string, value: string) => (
    <button
      className="icon-btn"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(label);
        } catch {
          setMessage(`${label}: ${value}`);
        }
      }}
    >
      {copied === label ? <span>Copied</span> : <Copy size={16} />}
    </button>
  );

  const uid = user.uid || user.id;
  const rows: Row[] = [
    { label: "FULL NAME", value: name, icon: User },
    { label: "EMAIL", value: user.email, icon: Mail },
    { label: "PHONE NUMBER", value: user.phoneNumber || "", icon: Phone },
    { label: "ACCOUNT ID", value: uid, icon: Hash, action: copyButton("Account ID", uid) },
    {
      label: "REFERRAL CODE",
      value: user.refcode || "",
      icon: Gift,
      action: user.refcode ? copyButton("Referral code", user.refcode) : undefined,
    },
    {
      label: "KYC STATUS",
      value: isDemo ? "N/A (Demo)" : kycLabels[kycStatus],
      icon: BadgeCheck,
      action:
        !isDemo && kycStatus !== "success" ? (
          <button className="link-button" onClick={() => setKycOpen(true)}>
            {kycStatus === "pending" ? "Details" : "Verify"}
          </button>
        ) : undefined,
    },
    { label: "MEMBER SINCE", value: memberSince(user.createdAt), icon: CalendarDays },
    // Demo sign-ins have no password of their own to change.
    {
      label: "LOGIN PASSWORD",
      value: isDemo ? "" : "••••••••",
      icon: KeyRound,
      action: (
        <button className="link-button" onClick={() => setPasswordOpen(true)}>
          Change
        </button>
      ),
    },
  ].filter((row) => row.value);

  // Empty wallets add nothing but noise; frozen-only wallets still count as holdings.
  const holdings = wallets.filter((wallet) => wallet.amount > 0 || wallet.amountFreezed > 0);

  return (
    <div>
      <div className="profile-heading">
        <b>
          <User size={19} /> MY ACCOUNT
        </b>
        {isDemo && <DemoBadge />}
      </div>
      <div className="page-padding">
        {isDemo && (
          <div className="demo-banner">
            <TriangleAlert size={22} />
            <div>
              <b>Demo Account — Virtual Funds</b>
              <p>This is a practice account. No real money is involved.</p>
              <CinematicLink href="/register" onClick={() => dispatch(authActions.doSignout())}>
                Open a Live Account →
              </CinematicLink>
            </div>
          </div>
        )}

        <section className="panel profile-info">
          <h2>PROFILE INFORMATION</h2>
          {rows.map((row) => (
            <div key={row.label} className="profile-row">
              <row.icon size={17} />
              <div>
                <small>{row.label}</small>
                <b>{row.value}</b>
              </div>
              {row.action}
            </div>
          ))}
        </section>

        <section className="panel profile-balance">
          <div>
            <small>ACCOUNT BALANCE</small>
            <h2 className="numeric" aria-live="polite">
              {assetsLoaded ? money(total) : assetsError ? "—" : "Loading…"}
            </h2>
            {assetsError && (
              <p className="field-error" role="alert">
                Couldn't load your balance: {assetsError}
              </p>
            )}
          </div>
          <button
            className="icon-btn"
            aria-label="Refresh balance"
            title="Refresh balance"
            disabled={assetsLoading}
            onClick={refresh}
          >
            <RefreshCw size={16} />
          </button>
          <AccountActions variant="buttons" />
        </section>

        {assetsLoaded && (
          <section className="panel profile-info profile-wallets">
            <h2>WALLETS</h2>
            {holdings.length === 0 ? (
              <div className="profile-row">
                <div>
                  <b>No funds yet</b>
                </div>
              </div>
            ) : (
              holdings.map((wallet) => (
                <div key={wallet._id} className="profile-row">
                  <div>
                    <small>
                      {wallet.coinName} · {wallet.accountType}
                      {wallet.status === "freezed" ? " · frozen" : ""}
                    </small>
                    <b className="numeric">
                      {coinAmount(wallet.amount)} {wallet.symbol}
                    </b>
                    {wallet.amountFreezed > 0 && (
                      <small>
                        Frozen: {coinAmount(wallet.amountFreezed)} {wallet.symbol}
                      </small>
                    )}
                  </div>
                  <b className="numeric">{money(AssetsService.value(wallet))}</b>
                </div>
              ))
            )}
          </section>
        )}

        <section className="panel profile-services">
          <h2>SERVICES</h2>
          <AccountActions variant="rows" />
        </section>
      </div>

      {kycOpen && <KycModal onClose={() => setKycOpen(false)} />}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}

      {message && (
        <Modal title="Account" onClose={() => setMessage("")}>
          <p>{message}</p>
          <button className="primary" onClick={() => setMessage("")}>
            Understood
          </button>
        </Modal>
      )}
    </div>
  );
}
