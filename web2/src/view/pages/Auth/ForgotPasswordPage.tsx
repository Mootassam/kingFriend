import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as yup from "yup";
import { i18n } from "src/i18n";
import AuthService from "src/modules/auth/authService";
import authSelectors from "src/modules/auth/authSelectors";
import Errors from "src/modules/shared/error/errors";
import yupFormSchemas from "src/modules/shared/yup/yupFormSchemas";
import InputFormItem from "src/shared/form/InputFormItem";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import AuthHero from "src/view/pages/Auth/AuthHero";
import "src/view/shared/styles/css/fonts-manrope.css";

const RESEND_COOLDOWN_SECONDS = 60;

const emailSchema = yup.object().shape({
  email: yupFormSchemas.string(i18n("user.fields.email"), { required: true }).email(i18n("validation.email")),
});

const codeSchema = yup.object().shape({
  code: yup
    .string()
    .required("Verification code is required")
    .matches(/^[0-9]{6}$/, "Enter the 6-digit code"),
});

const passwordSchema = yup.object().shape({
  newPassword: yupFormSchemas.password("New password", { required: true, min: 8 }),
  confirmPassword: yupFormSchemas
    .password("Confirm password", { required: true })
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

type Step = "email" | "code" | "password" | "done";

const HEADINGS: Record<Step, [string, string, string]> = {
  email: ["Forgot", "Password", "Enter your account email and we'll send you a verification code"],
  code: ["Check", "Email", ""],
  password: ["New", "Password", "Choose a new password of at least 8 characters"],
  done: ["All", "Set", "Your password has been changed. You can now sign in."],
};

// Same three-step email-code flow as the PC forgot-password page, using the same server endpoints.
export default function ForgotPasswordPage() {
  const signedIn = useSelector(authSelectors.selectSignedIn);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailForm = useForm<{ email: string }>({
    resolver: yupResolver(emailSchema) as any,
    defaultValues: { email: "" },
  });
  const codeForm = useForm<{ code: string }>({
    resolver: yupResolver(codeSchema) as any,
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: yupResolver(passwordSchema) as any,
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  if (signedIn && !exiting) {
    return <Redirect to="/app" />;
  }

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1 && timer.current) clearInterval(timer.current);
        return Math.max(value - 1, 0);
      });
    }, 1000);
  }

  async function run(action: () => Promise<void>) {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await action();
    } catch (error) {
      setErrorMessage(Errors.selectMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const sendCode = (target: string) =>
    run(async () => {
      await AuthService.sendForgotPasswordOtp(target);
      setEmail(target);
      setStep("code");
      startCooldown();
    });

  const onSubmitCode = ({ code }: { code: string }) =>
    run(async () => {
      await AuthService.verifyForgotPasswordOtp(email, code);
      setStep("password");
    });

  const onSubmitPassword = ({ newPassword }: { newPassword: string }) =>
    run(async () => {
      await AuthService.resetPasswordWithOtp(email, newPassword);
      setStep("done");
    });

  function changeEmail() {
    setErrorMessage("");
    codeForm.reset();
    setStep("email");
  }

  const [headingStart, headingEnd, subtitle] = HEADINGS[step];

  const submit = (idle: string, busy: string) => (
    <button className="primary signin" type="submit" disabled={loading} aria-busy={loading}>
      <span aria-live="polite">{loading ? busy : idle}</span>
      <ArrowRight size={19} aria-hidden="true" />
    </button>
  );

  const backToLogin = (
    <CinematicLink className="back" href="/login" onClick={() => setExiting(true)}>
      <ArrowLeft size={15} /> Back to Sign In
    </CinematicLink>
  );

  const header = (
    <>
      <span className="login-panel-kicker">A GLOBAL LEADER IN ONLINE TRADING</span>
      <h2>
        {headingStart} <span>{headingEnd}</span>
      </h2>
      <p>
        {step === "code" ? (
          <>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </>
        ) : (
          subtitle
        )}
      </p>
      {errorMessage && (
        <div className="login-error" role="alert">
          {errorMessage}
        </div>
      )}
    </>
  );

  return (
    <div className={"login " + (exiting ? "login-exiting" : "")}>
      <AuthHero />

      <section className="login-form">
        {step === "email" && (
          <FormProvider {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(({ email: value }) => sendCode(value.trim()))} noValidate>
              {header}
              <InputFormItem
                name="email"
                type="email"
                label="Email Address"
                autoComplete="email"
                placeholder={i18n("auth.fields.emailPlaceholder")}
                icon={<Mail size={20} aria-hidden="true" />}
              />
              {submit("Send Code", "Sending…")}
              {backToLogin}
            </form>
          </FormProvider>
        )}

        {step === "code" && (
          <FormProvider {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onSubmitCode)} noValidate>
              {header}
              <InputFormItem
                name="code"
                label="Verification Code"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                icon={<KeyRound size={20} aria-hidden="true" />}
              />
              {submit("Verify Code", "Verifying…")}
              <p className="center">
                {cooldown > 0 ? (
                  `Resend code in ${cooldown}s`
                ) : (
                  <button type="button" className="text-btn" onClick={() => sendCode(email)} disabled={loading}>
                    Resend code
                  </button>
                )}
                {" · "}
                <button type="button" className="text-btn" onClick={changeEmail}>
                  Change email
                </button>
              </p>
              {backToLogin}
            </form>
          </FormProvider>
        )}

        {step === "password" && (
          <FormProvider {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} noValidate>
              {header}
              <InputFormItem
                name="newPassword"
                type={showPassword ? "text" : "password"}
                label="New Password"
                autoComplete="new-password"
                placeholder="New password"
                wrapperClassName="password"
                icon={<LockKeyhole className="password-lock" size={20} aria-hidden="true" />}
              >
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </InputFormItem>
              <InputFormItem
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                label="Confirm Password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                wrapperClassName="password"
                icon={<LockKeyhole className="password-lock" size={20} aria-hidden="true" />}
              />
              {submit("Reset Password", "Saving…")}
              {backToLogin}
            </form>
          </FormProvider>
        )}

        {step === "done" && (
          <form onSubmit={(event) => event.preventDefault()}>
            <CheckCircle2 size={44} color="#17a35a" aria-hidden="true" />
            {header}
            {backToLogin}
          </form>
        )}
      </section>
    </div>
  );
}
