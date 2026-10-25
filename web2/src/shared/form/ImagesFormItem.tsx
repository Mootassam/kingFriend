import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { UploadedFile } from "src/modules/kyc/kycService";
import Errors from "src/modules/shared/error/errors";
import FileUploader, { FileStorageConfig } from "src/modules/shared/fileUpload/fileUploader";

interface Props {
  name: string;
  label: string;
  text: string;
  storage: FileStorageConfig;
  max?: number;
}

// Image field bound to react-hook-form, like PC's ImagesFormItem: each picked image is uploaded
// straight away and the field holds the uploaded files.
export default function ImagesFormItem({ name, label, text, storage, max = 1 }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const inputId = useId();
  const files: UploadedFile[] = watch(name) || [];
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    register(name);
  }, [register, name]);

  const message = (isSubmitted && (errors[name]?.message as string)) || uploadError;

  const pick = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const uploaded = await FileUploader.upload(file, { storage, image: true });
      setValue(name, [...files, uploaded], { shouldValidate: isSubmitted, shouldDirty: true });
    } catch (error) {
      Errors.handle(error);
      setUploadError(`Upload failed: ${Errors.selectMessage(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) =>
    setValue(
      name,
      files.filter((_, i) => i !== index),
      { shouldValidate: isSubmitted, shouldDirty: true },
    );

  return (
    <div className="image-field">
      <span className="image-field-label">{label}</span>
      <div className="image-field-list">
        {files.map((file, index) => (
          <div key={file.privateUrl} className="image-field-thumb">
            <img src={file.downloadUrl} alt={`${label} ${index + 1}`} />
            <button type="button" className="icon-btn" aria-label={`Remove ${label} image`} onClick={() => remove(index)}>
              <X size={14} />
            </button>
          </div>
        ))}
        {files.length < max && (
          <label htmlFor={inputId} className={"image-field-drop" + (message ? " invalid" : "")} aria-busy={uploading}>
            {uploading ? <LoaderCircle size={22} className="kc-spin" /> : <ImagePlus size={22} />}
            <small>{uploading ? "Uploading…" : text}</small>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {message && (
        <small className="field-error" role="alert">
          {message}
        </small>
      )}
    </div>
  );
}
