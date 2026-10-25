// Browser storage can throw (private mode, blocked site data), so every access is guarded.
export const storageKeys = {
  demo: "nexora-demo",
  jwt: "jwt",
  tenant: "tenant",
  welcome: "kingfriend-welcome",
  theme: "kingfriend-theme",
};

const safe = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

const storage = {
  get: (key: string) => safe(() => localStorage.getItem(key), null),
  set: (key: string, value: string) => safe(() => localStorage.setItem(key, value), undefined),
  remove: (key: string) => safe(() => localStorage.removeItem(key), undefined),
  getSession: (key: string) => safe(() => sessionStorage.getItem(key), null),
  setSession: (key: string, value: string) => safe(() => sessionStorage.setItem(key, value), undefined),
  removeSession: (key: string) => safe(() => sessionStorage.removeItem(key), undefined),
};

export default storage;
