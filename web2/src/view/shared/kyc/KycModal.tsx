import { yupResolver } from "@hookform/resolvers/yup";
import { CircleCheck, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import authActions from "src/modules/auth/authActions";
import authSelectors from "src/modules/auth/authSelectors";
import kycActions from "src/modules/kyc/kycActions";
import kycSelectors from "src/modules/kyc/kycSelectors";
import KycService, { DocumentType, KycSubmission } from "src/modules/kyc/kycService";
import Errors from "src/modules/shared/error/errors";
import { fileStorages } from "src/modules/shared/fileUpload/fileUploader";
import yupFormSchemas from "src/modules/shared/yup/yupFormSchemas";
import type { AppDispatch, RootState } from "src/modules/store";
import ImagesFormItem from "src/shared/form/ImagesFormItem";
import InputFormItem from "src/shared/form/InputFormItem";
import Modal from "src/view/shared/modals/Modal";
import SwitchTab from "src/view/shared/SwitchTab";
import * as yup from "yup";

const documentTypes = ["Passport", "ID Card", "Driver's License"] as const;
const documentValues: Record<(typeof documentTypes)[number], DocumentType> = {
  Passport: "passport",
  "ID Card": "idCard",
  "Driver's License": "driversLicense",
};

const images = (label: string, required: boolean) => {
  const schema = yup.array().default([]);
  return required ? schema.min(1, `${label} is required`) : schema;
};

// Same fields and rules as PC: a passport only needs its front side.
const createSchema = (documentType: DocumentType) =>
  yup.object({
    realname: yupFormSchemas.string("Full Name", { required: true, max: 255 }),
    idnumer: yupFormSchemas.string("Document Number", { required: true, max: 64 }),
    address: yupFormSchemas.string("Address", { required: true, max: 500 }),
    front: images("Front of Document", true),
    back: images("Back of Document", documentType !== "passport"),
  });

type Values = Omit<KycSubmission, "Documenttype">;

// Identity verification (KYC) in one dialog: current status, or the form to submit documents.
export default function KycModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(authSelectors.selectCurrentUser)!;
  const status = useSelector(kycSelectors.selectKycStatus);
  const latest = useSelector((state: RootState) => state.kyc.latest);
  const [checked, setChecked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [documentLabel, setDocumentLabel] = useState<(typeof documentTypes)[number]>("Passport");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const documentType = documentValues[documentLabel];

  useEffect(() => {
    Promise.all([dispatch(authActions.doRefreshCurrentUser()), dispatch(kycActions.doFetch())]).finally(() =>
      setChecked(true),
    );
  }, [dispatch]);

  const schema = useMemo(() => createSchema(documentType), [documentType]);
  const form = useForm<Values>({
    resolver: yupResolver(schema) as any,
    defaultValues: { realname: user.fullName || "", idnumer: "", address: "", front: [], back: [] },
  });

  const changeDocument = (label: (typeof documentTypes)[number]) => {
    setDocumentLabel(label);
    if (documentValues[label] === "passport") form.setValue("back", []);
  };

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    setServerError("");
    try {
      await KycService.create(user, {
        ...values,
        Documenttype: documentType,
        back: documentType === "passport" ? [] : values.back,
      });
      await dispatch(kycActions.doFetch());
      setShowForm(false);
    } catch (error) {
      Errors.handle(error);
      setServerError(Errors.selectMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!checked) {
    return (
      <Modal title="Identity Verification" onClose={onClose}>
        <p role="status">Checking your verification status…</p>
      </Modal>
    );
  }

  if (status === "success") {
    return (
      <Modal title="Verification Complete" onClose={onClose}>
        <p role="status" className="positive ticket-notice">
          <CircleCheck size={16} /> Your identity has been verified.
        </p>
        <p>You now have full access to all platform features.</p>
        <button className="primary" onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  if (status === "pending") {
    return (
      <Modal title="Verification Pending" onClose={onClose}>
        <p role="status" className="ticket-notice">
          <Clock size={16} /> Your documents are under review.
        </p>
        <p>
          We'll notify you once verification is complete. This usually takes 1-3 business days. You can't submit new
          documents while this application is being processed.
        </p>
        <button className="primary" onClick={onClose}>
          OK
        </button>
      </Modal>
    );
  }

  if (!showForm) {
    return (
      <Modal title="Verification Required" onClose={onClose}>
        {latest?.status === "canceled" && (
          <p role="alert" className="negative">
            Your previous submission was not approved. Please submit your documents again.
          </p>
        )}
        <p>Verify your identity to unlock deposits, withdrawals and withdraw password protection.</p>
        <div className="order-summary">
          <div>
            <span>You'll need</span>
            <b>A passport, ID card or driver's license</b>
          </div>
          <div>
            <span>Review time</span>
            <b>1-3 business days</b>
          </div>
        </div>
        <button className="primary" onClick={() => setShowForm(true)}>
          Verify Now
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Identity Verification" onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <span className="image-field-label">Document Type</span>
          <SwitchTab items={documentTypes} value={documentLabel} onChange={changeDocument} className="chips kyc-documents" />
          <InputFormItem
            name="realname"
            label="Full Name"
            placeholder="Enter your full name"
            autoComplete="name"
            wrapperClassName="modal-input"
          />
          <InputFormItem
            name="idnumer"
            label="Document Number"
            placeholder="Enter your document number"
            autoComplete="off"
            wrapperClassName="modal-input"
          />
          <InputFormItem
            name="address"
            label="Address"
            placeholder="Enter your complete address"
            autoComplete="street-address"
            wrapperClassName="modal-input"
          />
          <ImagesFormItem
            name="front"
            label="Front of Document"
            text="Upload front side"
            storage={fileStorages.categoryPhoto}
            max={2}
          />
          {documentType !== "passport" && (
            <ImagesFormItem
              name="back"
              label="Back of Document"
              text="Upload back side"
              storage={fileStorages.categoryPhoto}
              max={2}
            />
          )}
          <p className="kyc-security">
            <ShieldCheck size={15} /> Your documents are encrypted and checked manually by our team.
          </p>
          {serverError && (
            <p role="alert" className="negative">
              {serverError}
            </p>
          )}
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Validate Documents"}
          </button>
        </form>
      </FormProvider>
    </Modal>
  );
}
