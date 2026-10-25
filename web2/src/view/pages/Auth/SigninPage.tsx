import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight, Eye, EyeOff, FlaskConical, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as yup from "yup";
import { i18n } from "src/i18n";
import authActions from "src/modules/auth/authActions";
import authSelectors from "src/modules/auth/authSelectors";
import yupFormSchemas from "src/modules/shared/yup/yupFormSchemas";
import type { AppDispatch } from "src/modules/store";
import InputFormItem from "src/shared/form/InputFormItem";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import { useCinematicNav } from "src/view/shared/cinematic/CinematicProvider";
import Modal from "src/view/shared/modals/Modal";
import AuthHero from "src/view/pages/Auth/AuthHero";
import "src/view/shared/styles/css/fonts-manrope.css";

// Same rules as the PC sign-in: email required + valid format, password required, at least 6 characters.
const schema = yup.object().shape({
  email: yupFormSchemas
    .string(i18n("user.fields.email"), { required: true })
    .email(i18n("validation.email")),
  password: yupFormSchemas.password(i18n("user.fields.password"), { required: true, min: 6 }),
});

type FormValues = yup.InferType<typeof schema>;

type Pending = "" | "signin" | "demo";

export default function SigninPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { go } = useCinematicNav();
  const signedIn = useSelector(authSelectors.selectSignedIn);
  const externalErrorMessage = useSelector(authSelectors.selectErrorMessage);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [pending, setPending] = useState<Pending>("");
  const [exiting, setExiting] = useState(false);

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    dispatch(authActions.doClearErrorMessage());
  }, [dispatch]);

  // Already signed in (and not mid-transition): go straight to the workspace.
  if (signedIn && !exiting) {
    return <Redirect to="/app" />;
  }

  // Only enter the workspace when the backend accepted the login and /auth/me returned the user.
  function finish(ok: boolean) {
    if (ok) {
      setExiting(true);
      go("/app", 650);
    } else {
      setPending("");
    }
  }

  const onSubmit = async ({ email, password }: FormValues) => {
    if (pending) return;
    setPending("signin");
    finish(await dispatch(authActions.doSigninWithEmailAndPassword(email ?? "", password ?? "")));
  };

  async function onDemo() {
    if (pending) return;
    setForgotOpen(false);
    setPending("demo");
    form.clearErrors();
    finish(await dispatch(authActions.doDemoLogin()));
  }

  const busy = pending !== "";

  return (
    <div className={"login " + (exiting ? "login-exiting" : "")}>
      <AuthHero />

      <section className="login-form">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <span className="login-panel-kicker">A GLOBAL LEADER IN ONLINE TRADING</span>
            <h2>
              Sign <span>In</span>
            </h2>
            <p>Access your KingFriend account</p>

            {externalErrorMessage && (
              <div className="login-error" role="alert">
                {externalErrorMessage}
              </div>
            )}

            <InputFormItem
              name="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              placeholder={i18n("auth.fields.emailPlaceholder")}
              icon={<Mail size={20} aria-hidden="true" />}
            />
            <InputFormItem
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              autoComplete="current-password"
              placeholder={i18n("auth.fields.passwordPlaceholder")}
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

            <button type="button" className="text-btn forgot" onClick={() => setForgotOpen(true)}>
              Forgot Password?
            </button>
            <button className="primary signin" type="submit" disabled={busy} aria-busy={pending === "signin"}>
              <span aria-live="polite">
                {pending === "signin" ? i18n("auth.signin.signingIn") : i18n("auth.signin.button")}
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            <p className="center">
              Don't have an account?{" "}
              <CinematicLink className="text-btn" href="/register" onClick={() => setExiting(true)}>
                Open Account
              </CinematicLink>
            </p>
            <div className="divider">or</div>
            <button className="demo-enter" type="button" onClick={onDemo} disabled={busy} aria-busy={pending === "demo"}>
              <FlaskConical size={19} aria-hidden="true" />
              <span aria-live="polite">
                {pending === "demo" ? "Starting demo…" : "Try Demo Account — Virtual Funds"}
              </span>
              <ArrowRight className="demo-arrow" size={17} aria-hidden="true" />
            </button>
            <small id="login-help">
              Sign in with your KingFriend account, or start a demo account instantly.
              <br />
              Demo accounts use virtual funds only.
            </small>
            <CinematicLink className="back" href="/" onClick={() => setExiting(true)}>
              <ArrowLeft size={15} /> Back to Home
            </CinematicLink>
          </form>
        </FormProvider>
      </section>

      {forgotOpen && (
        <Modal title="Forgot your password?" onClose={() => setForgotOpen(false)}>
          <p>
            Password reset isn't available on this page yet. Please contact support to reset your password, or try
            the platform right away with a demo account.
          </p>
          <button className="primary" onClick={onDemo} disabled={busy}>
            Start a demo account
          </button>
        </Modal>
      )}
    </div>
  );
}
