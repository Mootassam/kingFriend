import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import FormErrors from 'src/view/shared/form/formErrors';

const Field = styled.div`
  margin-bottom: 18px;

  label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
  }

  .auth-input {
    position: relative;
  }

  .auth-input-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--text-muted);
    pointer-events: none;
    transition: color 0.15s var(--ease);
  }

  && .form-control {
    height: 46px;
    padding-left: 40px;
    font-size: 15px;
    border-radius: var(--radius);
  }

  /* The red border and message are enough; Bootstrap's icon would sit on the eye button. */
  && .form-control.is-invalid {
    padding-right: 14px;
    background-image: none;
  }

  && .form-control.has-reveal {
    padding-right: 44px;
  }

  .auth-input:has(.is-invalid) .auth-input-icon {
    color: var(--danger);
  }

  .auth-input:focus-within .auth-input-icon {
    color: var(--accent-text);
  }

  .auth-reveal {
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }

  .auth-reveal:hover {
    color: var(--text);
    background: var(--hover);
  }

  .auth-reveal:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .invalid-feedback {
    display: block;
    margin-top: 6px;
  }
`;

function AuthField(props: {
  name: string;
  label: string;
  icon: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  externalErrorMessage?: string;
}) {
  const { name, type = 'text' } = props;
  const [revealed, setRevealed] = useState(false);
  const {
    register,
    errors,
    formState: { touched, isSubmitted },
  } = useFormContext();

  const errorMessage = FormErrors.errorMessage(
    name,
    errors,
    touched,
    isSubmitted,
    props.externalErrorMessage as any,
  );

  const isPassword = type === 'password';

  return (
    <Field>
      <label htmlFor={name}>{props.label}</label>
      <div className="auth-input">
        <i className={`auth-input-icon ${props.icon}`} />
        <input
          id={name}
          name={name}
          ref={register}
          type={isPassword && revealed ? 'text' : type}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          autoFocus={props.autoFocus || undefined}
          className={`form-control ${isPassword ? 'has-reveal' : ''} ${
            errorMessage ? 'is-invalid' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-reveal"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            title={revealed ? 'Hide password' : 'Show password'}
          >
            <i className={revealed ? 'fas fa-eye-slash' : 'fas fa-eye'} />
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="invalid-feedback">{errorMessage}</div>
      )}
    </Field>
  );
}

export default AuthField;
