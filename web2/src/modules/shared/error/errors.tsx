import { i18n } from "src/i18n";

// The server answers errors with the (already translated) message as the response body.
function selectErrorMessage(error): string {
  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.error?.message) return data.error.message;
    if (Array.isArray(data.errors) && data.errors[0]?.message) return data.errors[0].message;
  }
  if (error?.response === undefined && error?.request) {
    return i18n("errors.network");
  }
  return error?.message || i18n("errors.defaultErrorMessage");
}

function selectErrorCode(error): number {
  return error?.response?.status ?? 500;
}

export default class Errors {
  static errorCode(error) {
    return selectErrorCode(error);
  }

  static selectMessage(error) {
    return selectErrorMessage(error);
  }

  static handle(error) {
    console.error(selectErrorMessage(error), error);
  }
}
