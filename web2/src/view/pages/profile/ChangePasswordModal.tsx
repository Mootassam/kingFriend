import { yupResolver } from "@hookform/resolvers/yup";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import authActions from "src/modules/auth/authActions";
import AuthService from "src/modules/auth/authService";
import Errors from "src/modules/shared/error/errors";
import yupFormSchemas from "src/modules/shared/yup/yupFormSchemas";
import type { AppDispatch } from "src/modules/store";
import InputFormItem from "src/shared/form/InputFormItem";
import Modal from "src/view/shared/modals/Modal";
import * as yup from "yup";

// Same fields and rules as PC's /loginpassword page.
const schema = yup.object({
  oldPassword: yupFormSchemas.password("Old Password", { required: true }),
  newPassword: yupFormSchemas.password("New Password", { required: true }),
  newPasswordConfirmation: yupFormSchemas
    .password("Confirm Password", { required: true })
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

interface Values {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const form = useForm<Values>({
    resolver: yupResolver(schema) as any,
    defaultValues: { oldPassword: "", newPassword: "", newPasswordConfirmation: "" },
  });

  const submit = async ({ oldPassword, newPassword }: Values) => {
    setBusy(true);
    setServerError("");
    try {
      await AuthService.changePassword(oldPassword, newPassword);
      await dispatch(authActions.doRefreshCurrentUser());
      setDone(true);
    } catch (error) {
      Errors.handle(error);
      setServerError(Errors.selectMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Modal title="Login Password" onClose={onClose}>
        <p role="status" className="positive ticket-notice">
          <CircleCheck size={16} />
          Your login password has been changed.
        </p>
        <button className="primary" onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Change Login Password" onClose={onClose}>
      <p>
        For the safety of your funds, withdrawals are not allowed within 24 hours after the login password has been
        changed.
      </p>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submit)} noValidate>
          <InputFormItem
            name="oldPassword"
            label="Old Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            wrapperClassName="modal-input"
          />
          <InputFormItem
            name="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a new password"
            wrapperClassName="modal-input"
          />
          <InputFormItem
            name="newPasswordConfirmation"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            wrapperClassName="modal-input"
          />
          {serverError && (
            <p role="alert" className="negative">
              {serverError}
            </p>
          )}
          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </FormProvider>
    </Modal>
  );
}
