import { yupResolver } from "@hookform/resolvers/yup";
import { CircleCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import assetsActions from "src/modules/assets/assetsActions";
import assetsSelectors from "src/modules/assets/assetsSelectors";
import authActions from "src/modules/auth/authActions";
import authSelectors from "src/modules/auth/authSelectors";
import AuthService, { BankDetails } from "src/modules/auth/authService";
import kycActions from "src/modules/kyc/kycActions";
import kycSelectors from "src/modules/kyc/kycSelectors";
import Errors from "src/modules/shared/error/errors";
import yupFormSchemas from "src/modules/shared/yup/yupFormSchemas";
import type { AppDispatch } from "src/modules/store";
import WithdrawService, { MIN_WITHDRAW, WITHDRAW_CURRENCY } from "src/modules/withdraw/withdrawService";
import { money } from "src/shared/Amount";
import InputFormItem from "src/shared/form/InputFormItem";
import KycModal from "src/view/shared/kyc/KycModal";
import Modal from "src/view/shared/modals/Modal";
import * as yup from "yup";

type Step = "withdraw" | "bank" | "password" | "done";

const bankFields = [
  { name: "accountHolder", label: "Account Holder Name" },
  { name: "ibanNumber", label: "Account Number" },
  { name: "bankName", label: "Bank Name" },
  { name: "ifscCode", label: "IFSC Code" },
] as const;

const bankSchema = yup.object({
  accountHolder: yupFormSchemas.string("Account Holder Name", { required: true, max: 255 }),
  ibanNumber: yupFormSchemas.string("Account Number", { required: true, max: 64 }),
  bankName: yupFormSchemas.string("Bank Name", { required: true, max: 255 }),
  ifscCode: yupFormSchemas.string("IFSC Code", { required: true, max: 64 }),
});

const passwordSchema = yup.object({
  newPassword: yupFormSchemas.password("Withdraw Password", { required: true }),
  newPasswordConfirmation: yupFormSchemas
    .password("Confirm Withdraw Password", { required: true })
    .oneOf([yup.ref("newPassword")], "The passwords don't match"),
});

interface Props {
  onClose: () => void;
  // "bank" opens straight on the bank details (the Add Bank Account action).
  initialStep?: "withdraw" | "bank";
}

// Withdrawal in one dialog: bank details and withdraw password are asked for here when missing.
export default function WithdrawModal({ onClose, initialStep = "withdraw" }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(authSelectors.selectCurrentUser)!;
  const kycStatus = useSelector(kycSelectors.selectKycStatus);
  const wallets = useSelector(assetsSelectors.selectRows);
  const assetsLoaded = useSelector(assetsSelectors.selectLoaded);
  const [step, setStep] = useState<Step>(initialStep);
  const [returnToWithdraw, setReturnToWithdraw] = useState(initialStep === "withdraw");
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [withdrawn, setWithdrawn] = useState(0);
  const [kycChecked, setKycChecked] = useState(Boolean(user.kyc));
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    dispatch(authActions.doRefreshCurrentUser());
    dispatch(assetsActions.doFetch());
    dispatch(kycActions.doFetch()).finally(() => setKycChecked(true));
  }, [dispatch]);

  // The server pays withdrawals out of the USDT exchange wallet.
  const balance = wallets.find((w) => w.symbol === WITHDRAW_CURRENCY && w.accountType === "exchange")?.amount ?? 0;
  const bankComplete = bankFields.every((field) => user[field.name]?.trim());
  const hasWithdrawPassword = Boolean(user.withdrawPassword);

  const withdrawSchema = useMemo(
    () =>
      yup.object({
        amount: yup
          .number()
          .transform((value, original) => (String(original).trim() === "" ? undefined : value))
          .typeError("Withdrawal Amount must be a number")
          .required("Withdrawal Amount is required")
          .integer("Withdrawal Amount must be a whole number")
          .min(MIN_WITHDRAW, `The minimum withdrawal is ${money(MIN_WITHDRAW)}`)
          .max(balance, `You can withdraw up to ${money(balance)}`),
        withdrawPassword: yup.string().required("Withdraw Password is required"),
      }),
    [balance],
  );

  const withdrawForm = useForm({
    resolver: yupResolver(withdrawSchema) as any,
    defaultValues: { amount: "", withdrawPassword: "" },
  });
  const bankForm = useForm<BankDetails>({
    resolver: yupResolver(bankSchema) as any,
    defaultValues: {
      accountHolder: user.accountHolder || "",
      ibanNumber: user.ibanNumber || "",
      bankName: user.bankName || "",
      ifscCode: user.ifscCode || "",
    },
  });
  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema) as any,
    defaultValues: { newPassword: "", newPasswordConfirmation: "" },
  });

  const go = (next: Step) => {
    setServerError("");
    setStep(next);
  };

  // Runs a server call, showing its error in the dialog instead of closing it.
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setServerError("");
    try {
      await task();
    } catch (error) {
      Errors.handle(error);
      setServerError(Errors.selectMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveBank = (values: BankDetails) =>
    run(async () => {
      await AuthService.updateBankDetails(values);
      await dispatch(authActions.doRefreshCurrentUser());
      if (returnToWithdraw) go(hasWithdrawPassword ? "withdraw" : "password");
      else onClose();
    });

  const savePassword = ({ newPassword }) =>
    run(async () => {
      await AuthService.changeWithdrawPassword(undefined, newPassword);
      await dispatch(authActions.doRefreshCurrentUser());
      go("withdraw");
    });

  const submitWithdraw = ({ amount, withdrawPassword }) => {
    // The server doesn't check this password yet; don't send a request it would wrongly accept.
    if (withdrawPassword !== user.withdrawPassword) {
      setServerError("The withdraw password is incorrect.");
      return;
    }
    return run(async () => {
      await WithdrawService.create({ amount: Number(amount), withdrawPassword });
      setWithdrawn(Number(amount));
      dispatch(assetsActions.doFetch());
      go("done");
    });
  };

  const error = serverError && (
    <p role="alert" className="negative">
      {serverError}
    </p>
  );

  // Bank details can be added any time; withdrawing needs a verified identity (same rule as PC).
  const needsKyc = step !== "bank";

  if (needsKyc && !kycChecked) {
    return (
      <Modal title="Withdraw Funds" onClose={onClose}>
        <p role="status">Checking your account…</p>
      </Modal>
    );
  }

  if (needsKyc && kycStatus !== "success") {
    if (verifying) return <KycModal onClose={onClose} />;
    return (
      <Modal title="Withdraw Funds" onClose={onClose}>
        <p>
          {kycStatus === "pending"
            ? "Your identity verification is under review. You can withdraw as soon as it is approved."
            : "Withdrawals are available once your identity (KYC) is verified."}
        </p>
        {kycStatus === "pending" ? (
          <button className="primary" onClick={onClose}>
            OK
          </button>
        ) : (
          <button className="primary" onClick={() => setVerifying(true)}>
            Verify Now
          </button>
        )}
      </Modal>
    );
  }

  if (step === "bank" || (step === "withdraw" && !bankComplete)) {
    return (
      <Modal title="Bank Account" onClose={onClose}>
        <p>Withdrawals are sent to this bank account.</p>
        <FormProvider {...bankForm}>
          <form onSubmit={bankForm.handleSubmit(saveBank)} noValidate>
            {bankFields.map((field) => (
              <InputFormItem
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.label}
                autoComplete="off"
                wrapperClassName="modal-input"
              />
            ))}
            {error}
            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : returnToWithdraw ? "Save and continue" : "Save"}
            </button>
          </form>
        </FormProvider>
      </Modal>
    );
  }

  if (step === "password" || (step === "withdraw" && !hasWithdrawPassword)) {
    return (
      <Modal title="Set Withdraw Password" onClose={onClose}>
        <p>You'll enter this password to confirm every withdrawal.</p>
        <FormProvider {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(savePassword)} noValidate>
            <InputFormItem
              name="newPassword"
              label="Withdraw Password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a withdraw password"
              wrapperClassName="modal-input"
            />
            <InputFormItem
              name="newPasswordConfirmation"
              label="Confirm Withdraw Password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat the withdraw password"
              wrapperClassName="modal-input"
            />
            {error}
            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save and continue"}
            </button>
          </form>
        </FormProvider>
      </Modal>
    );
  }

  if (step === "done") {
    return (
      <Modal title="Request Submitted" onClose={onClose}>
        <p role="status" className="positive ticket-notice">
          <CircleCheck size={16} />
          Your withdrawal of {money(withdrawn)} is being processed.
        </p>
        <p>It can take up to 24 hours. You will receive your withdrawal soon.</p>
        <button className="primary" onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Withdraw Funds" onClose={onClose}>
      <div className="order-summary">
        <div>
          <span>Available Balance</span>
          <b className="numeric">{assetsLoaded ? money(balance) : "—"}</b>
        </div>
        <div>
          <span>Bank Account</span>
          <b>
            {user.bankName} · {user.accountHolder}{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setReturnToWithdraw(true);
                go("bank");
              }}
            >
              Edit
            </button>
          </b>
        </div>
        <div>
          <span>Minimum Withdrawal</span>
          <b className="numeric">{money(MIN_WITHDRAW)}</b>
        </div>
      </div>
      <FormProvider {...withdrawForm}>
        <form onSubmit={withdrawForm.handleSubmit(submitWithdraw)} noValidate>
          <InputFormItem
            name="amount"
            label="Withdrawal Amount"
            type="number"
            placeholder={`Enter amount (min. ${money(MIN_WITHDRAW)})`}
            wrapperClassName="modal-input"
          />
          <InputFormItem
            name="withdrawPassword"
            label="Withdraw Password"
            type="password"
            autoComplete="off"
            placeholder="Enter your withdraw password"
            wrapperClassName="modal-input"
          />
          {error}
          <button className="primary" type="submit" disabled={busy || !assetsLoaded}>
            {busy ? "Submitting…" : "Confirm Withdrawal"}
          </button>
        </form>
      </FormProvider>
    </Modal>
  );
}
