import storage, { storageKeys } from "src/security/storage";

export default class AuthToken {
  static get() {
    return storage.get(storageKeys.jwt) || null;
  }

  static set(token: string | null) {
    if (token) {
      storage.set(storageKeys.jwt, token);
    } else {
      storage.remove(storageKeys.jwt);
    }
  }
}
