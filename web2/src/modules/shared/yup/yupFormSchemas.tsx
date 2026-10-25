import * as yup from "yup";
import { i18n } from "src/i18n";

const fill = (key: string, label: string, extra: Record<string, string | number> = {}) =>
  Object.entries({ path: label, ...extra }).reduce(
    (message, [name, value]) => message.replace(`{${name}}`, String(value)),
    i18n(key),
  );

// Same helper shape as PC's yupFormSchemas: field label + options -> schema with translated messages.
const yupFormSchemas = {
  string(label: string, config: { required?: boolean; min?: number; max?: number } = {}) {
    let schema = yup
      .string()
      .transform((value) => (value == null ? "" : String(value).trim()))
      .label(label);

    if (config.required) {
      schema = schema.required(fill("validation.required", label));
    }
    if (config.min || config.min === 0) {
      schema = schema.min(config.min, fill("validation.min", label, { min: config.min }));
    }
    if (config.max) {
      schema = schema.max(config.max, fill("validation.max", label, { max: config.max }));
    }
    return schema;
  },

  // Passwords are not trimmed: spaces may be part of them.
  password(label: string, config: { required?: boolean; min?: number } = {}) {
    let schema = yup.string().label(label);
    if (config.required) {
      schema = schema.required(fill("validation.required", label));
    }
    if (config.min) {
      schema = schema.min(config.min, fill("validation.min", label, { min: config.min }));
    }
    return schema;
  },
};

export default yupFormSchemas;
