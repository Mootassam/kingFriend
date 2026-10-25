import config from "src/config";
import storage, { storageKeys } from "src/security/storage";

export default class AuthCurrentTenant {
  static get(): string | null {
    const tenant = this.getTN();
    return tenant ? tenant.id : null;
  }

  // Each server has its own tenant id, so a tenant saved while using another API
  // (live vs local) is ignored and fetched again.
  static getTN() {
    const raw = storage.get(storageKeys.tenant);
    if (!raw) return null;
    try {
      const tenant = JSON.parse(raw);
      return tenant?.apiUrl === config.backendUrl ? tenant : null;
    } catch {
      return null;
    }
  }

  static set(tenant) {
    if (!tenant) {
      this.clear();
      return;
    }
    storage.set(storageKeys.tenant, JSON.stringify({ ...tenant, apiUrl: config.backendUrl }));
  }

  static clear() {
    storage.remove(storageKeys.tenant);
  }
}
