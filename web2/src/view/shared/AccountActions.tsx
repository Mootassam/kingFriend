import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, Landmark, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import authSelectors from "src/modules/auth/authSelectors";
import chatWidgetBus from "src/view/shared/chat/chatWidgetBus";
import Modal from "src/view/shared/modals/Modal";
import KycModal from "src/view/shared/kyc/KycModal";
import WithdrawModal from "src/view/shared/withdraw/WithdrawModal";

type Run = "chat" | "bank" | "kyc";

const actions: {
  name: string;
  title: string;
  description: string;
  realDescription: string;
  short: string;
  icon: typeof Landmark;
  color: string;
  message: string;
  run: Run;
  // Prefilled in the live chat composer so the user can send it straight away.
  chatMessage?: string;
}[] = [
  {
    name: "Deposit",
    title: "Deposit Funds",
    description: "Fund your demo trading account",
    realDescription: "Get deposit details from our support team",
    short: "Add funds",
    icon: ArrowDownToLine,
    color: "positive",
    message: "Demo mode — real deposits are disabled.",
    // Same as PC: deposits go through customer support.
    run: "chat",
    chatMessage: "Hello, I would like to make a deposit. Could you please send me the deposit details?",
  },
  {
    name: "Withdrawal",
    title: "Withdraw Funds",
    description: "Demo withdrawal simulation",
    realDescription: "Request a withdrawal from our support team",
    short: "Cash out",
    icon: ArrowUpFromLine,
    color: "blue",
    message: "Demo mode — real withdrawals are disabled.",
    // Withdrawals also go through customer support instead of a separate form.
    run: "chat",
    chatMessage: "Hello, I would like to withdraw funds from my account. Could you please help me with the withdrawal?",
  },
  {
    name: "KYC",
    title: "Identity Verification (KYC)",
    description: "Not available on demo account",
    realDescription: "Verify your identity",
    short: "Verify identity",
    icon: ShieldCheck,
    color: "amber",
    message: "Identity verification is unavailable in demo mode.",
    run: "kyc",
  },
  {
    name: "Bank",
    title: "Add Bank Account",
    description: "Not available on demo account",
    realDescription: "Link a bank account for withdrawals",
    short: "",
    icon: Landmark,
    color: "purple",
    message: "Bank accounts cannot be added in this demo. No financial credentials are collected.",
    run: "bank",
  },
];

const visibleCount = { buttons: 2, cards: 3, rows: 4 };

export default function AccountActions({ variant = "cards" }: { variant?: "cards" | "buttons" | "rows" }) {
  const [message, setMessage] = useState("");
  const [bank, setBank] = useState(false);
  const [kyc, setKyc] = useState(false);
  const isDemo = useSelector(authSelectors.selectIsDemo);

  // Demo accounts get an explanation; real accounts get the action itself.
  const run = (action: (typeof actions)[number]) => {
    if (isDemo) setMessage(action.message);
    else if (action.run === "chat") chatWidgetBus.open(action.chatMessage);
    else if (action.run === "kyc") setKyc(true);
    else setBank(true);
  };

  return (
    <>
      <div className={"account-actions " + variant}>
        {actions.slice(0, visibleCount[variant]).map((action) => (
          <button key={action.name} className={"account-action " + action.color} onClick={() => run(action)}>
            <span className="action-icon">
              <action.icon size={23} />
            </span>
            <span>
              <b>{variant === "rows" ? action.title : action.name}</b>
              {variant !== "buttons" && (
                <small>{variant === "rows" ? (isDemo ? action.description : action.realDescription) : action.short}</small>
              )}
            </span>
            {variant === "rows" && <ChevronRight className="row-chevron" size={17} />}
          </button>
        ))}
      </div>
      {message && (
        <Modal title="Demo account" onClose={() => setMessage("")}>
          <p>{message}</p>
          <button className="primary" onClick={() => setMessage("")}>
            Understood
          </button>
        </Modal>
      )}
      {bank && <WithdrawModal initialStep="bank" onClose={() => setBank(false)} />}
      {kyc && <KycModal onClose={() => setKyc(false)} />}
    </>
  );
}
