import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, RefreshCw, ShieldCheck, Ticket } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import AuthHero from "src/view/pages/Auth/AuthHero";
import "src/view/shared/styles/css/fonts-manrope.css";

const label = (key: string) => i18n(`pages.signup.labels.${key}`);
const placeholder = (key: string) => i18n(`pages.signup.placeholders.${key}`);

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCaptcha = () =>
  Array.from({ length: 6 }, () => CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length))).join("");

// Same fields and rules as the PC sign-up; the invitation code itself is verified by the server.
const buildSchema = (captcha: { current: string }) =>
  yup.object().shape({
    email: yupFormSchemas.string(label("email"), { required: true }).email(i18n("validation.email")),
    phoneNumber: yupFormSchemas.string(label("phoneNumber"), { required: true, min: 6, max: 20 }),
    invitationCode: yupFormSchemas.string(label("invitationCode"), { required: true }),
    captcha: yupFormSchemas
      .string(label("captcha"), { required: true })
      .test("captcha-match", i18n("pages.signup.captchaMismatch"), (value) => (value || "").toUpperCase() === captcha.current),
    password: yupFormSchemas.password(label("password"), { required: true, min: 8 }),
    newPasswordConfirmation: yupFormSchemas
      .password(label("confirmPassword"), { required: true })
      .oneOf([yup.ref("password")], i18n("pages.signup.passwordsMustMatch")),
  });

type FormValues = {
  email: string;
  phoneNumber: string;
  invitationCode: string;
  captcha: string;
  password: string;
  newPasswordConfirmation: string;
};

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { go } = useCinematicNav();
  const signedIn = useSelector(authSelectors.selectSignedIn);
  const errorMessage = useSelector(authSelectors.selectErrorMessage);
  const [captcha, setCaptcha] = useState(newCaptcha);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [exiting, setExiting] = useState(false);
  const captchaRef = useRef(captcha);
  captchaRef.current = captcha;
  const [schema] = useState(() => buildSchema(captchaRef));

  const form = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      phoneNumber: "",
      invitationCode: "",
      captcha: "",
      password: "",
      newPasswordConfirmation: "",
    },
  });

  useEffect(() => {
    dispatch(authActions.doClearErrorMessage());
  }, [dispatch]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(newCaptcha());
    form.setValue("captcha", "");
    form.clearErrors("captcha");
  }, [form]);

  if (signedIn && !exiting) {
    return <Redirect to="/app" />;
  }

  const onSubmit = async ({ email, password, phoneNumber, invitationCode }: FormValues) => {
    if (pending) return;
    setPending(true);
    const ok = await dispatch(
      authActions.doRegisterEmailAndPassword(email.trim(), password, phoneNumber.trim(), invitationCode.trim()),
    );
    if (ok) {
      setExiting(true);
      go("/app", 650);
    } else {
      setPending(false);
      refreshCaptcha();
    }
  };

  const passwordToggle = (
    <button
      type="button"
      aria-label={showPassword ? "Hide password" : "Show password"}
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  );

  return (
    <div className={"login register " + (exiting ? "login-exiting" : "")}>
      <AuthHero />

      <section className="login-form">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <span className="login-panel-kicker">A GLOBAL LEADER IN ONLINE TRADING</span>
            <h2>
              Open <span>Account</span>
            </h2>
            <p>Create your KingFriend account</p>

            {errorMessage && (
              <div className="login-error" role="alert">
                {errorMessage}
              </div>
            )}

            <InputFormItem
              name="email"
              type="email"
              label={label("email")}
              placeholder={placeholder("email")}
              autoComplete="email"
              icon={<Mail size={20} aria-hidden="true" />}
            />
            <InputFormItem
              name="phoneNumber"
              type="tel"
              label={label("phoneNumber")}
              placeholder={placeholder("phoneNumber")}
              autoComplete="tel"
              icon={<Phone size={20} aria-hidden="true" />}
            />
            <InputFormItem
              name="invitationCode"
              label={label("invitationCode")}
              placeholder={placeholder("invitationCode")}
              autoComplete="off"
              icon={<Ticket size={20} aria-hidden="true" />}
            />

            <div className="captcha-row">
              <InputFormItem
                name="captcha"
                label={label("captcha")}
                placeholder={placeholder("captcha")}
                autoComplete="off"
                icon={<ShieldCheck size={20} aria-hidden="true" />}
              />
              <button
                type="button"
                className="captcha-display"
                onClick={refreshCaptcha}
                aria-label={`Verification code ${captcha.split("").join(" ")}. Click to refresh.`}
              >
                <span className="captcha-text" aria-hidden="true">
                  {captcha}
                </span>
                <span className="captcha-refresh">
                  <RefreshCw size={12} /> {i18n("pages.signup.refresh")}
                </span>
              </button>
            </div>

            <InputFormItem
              name="password"
              type={showPassword ? "text" : "password"}
              label={label("password")}
              placeholder={placeholder("password")}
              autoComplete="new-password"
              wrapperClassName="password"
              icon={<LockKeyhole className="password-lock" size={20} aria-hidden="true" />}
            >
              {passwordToggle}
            </InputFormItem>
            <InputFormItem
              name="newPasswordConfirmation"
              type={showPassword ? "text" : "password"}
              label={label("confirmPassword")}
              placeholder={placeholder("confirmPassword")}
              autoComplete="new-password"
              wrapperClassName="password"
              icon={<LockKeyhole className="password-lock" size={20} aria-hidden="true" />}
            />

            <button className="primary signin" type="submit" disabled={pending} aria-busy={pending}>
              <span aria-live="polite">
                {pending ? i18n("pages.signup.creatingAccount") : i18n("pages.signup.createAccount")}
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            <p className="center">
              {i18n("pages.signup.alreadyHaveAccount")}{" "}
              <CinematicLink className="text-btn" href="/login" onClick={() => setExiting(true)}>
                {i18n("pages.signup.signIn")}
              </CinematicLink>
            </p>
            <CinematicLink className="back" href="/" onClick={() => setExiting(true)}>
              <ArrowLeft size={15} /> Back to Home
            </CinematicLink>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
