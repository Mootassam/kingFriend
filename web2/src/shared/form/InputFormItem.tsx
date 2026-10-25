import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
  // Rendered after the input inside the wrapper (e.g. a show-password toggle).
  children?: ReactNode;
}

// Input bound to the surrounding react-hook-form context, with its validation message underneath.
export default function InputFormItem({
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  icon,
  wrapperClassName = "login-input-wrap",
  children,
}: Props) {
  const {
    register,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const message = errors[name]?.message as string | undefined;
  const invalid = Boolean(message) && isSubmitted;
  const errorId = `${name}-error`;

  return (
    <label>
      {label}
      <span className={wrapperClassName + (invalid ? " invalid" : "")}>
        {icon}
        <input
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          {...register(name)}
        />
        {children}
      </span>
      {invalid && (
        <small id={errorId} className="field-error" role="alert">
          {message}
        </small>
      )}
    </label>
  );
}
