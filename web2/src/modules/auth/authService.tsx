import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import AuthToken from "src/modules/auth/authToken";
import authAxios from "src/modules/shared/axios/authAxios";
import storage, { storageKeys } from "src/security/storage";

export interface CurrentUser {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  uid?: string;
  accountType?: "real" | "demo";
  kyc?: boolean;
  emailVerified?: boolean;
  phoneNumber?: string;
  refcode?: string;
  createdAt?: string;
  accountHolder?: string;
  ibanNumber?: string;
  bankName?: string;
  ifscCode?: string;
  // Sent by the server as plain text. Only ever checked for presence or compared, never shown.
  withdrawPassword?: string;
}

export interface BankDetails {
  accountHolder: string;
  ibanNumber: string;
  bankName: string;
  ifscCode: string;
}

export type WelcomeKind = "signin" | "signup";

export default class AuthService {
  static async signinWithEmailAndPassword(email: string, password: string): Promise<string> {
    const tenantId = await this.ensureTenantId();
    const response = await authAxios.post("/auth/sign-in", { email, password, tenantId });
    return response.data;
  }

  // Real account; the server checks the invitation code and returns a token for the new user.
  static async registerWithEmailAndPassword(
    email: string,
    password: string,
    phoneNumber: string,
    invitationCode: string,
  ): Promise<string> {
    const tenantId = await this.ensureTenantId();
    const response = await authAxios.post("/auth/signupmobile", {
      email,
      password,
      phoneNumber,
      invitationCode,
      tenantId,
    });
    return response.data;
  }

  // Creates a fresh server-side demo user (pre-funded virtual assets) and returns its token.
  static async demoLogin(): Promise<string> {
    const tenantId = await this.ensureTenantId();
    const response = await authAxios.post("/auth/demo-login", { tenantId });
    return response.data;
  }

  static async fetchMe(): Promise<CurrentUser> {
    const response = await authAxios.get("/auth/me");
    return response.data;
  }

  static async updateBankDetails(data: BankDetails) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.put(`/tenant/${tenantId}/user/updateMyBankInfo`, { data });
    return response.data;
  }

  // Login password, same endpoint as PC's /loginpassword page.
  static async changePassword(oldPassword: string, newPassword: string) {
    const response = await authAxios.put("/auth/change-password", { oldPassword, newPassword });
    return response.data;
  }

  // oldPassword is required by the server once a withdraw password exists.
  static async changeWithdrawPassword(oldPassword: string | undefined, newPassword: string) {
    const tenantId = AuthCurrentTenant.get();
    const body: { newPassword: string; oldPassword?: string } = { newPassword };
    if (oldPassword) body.oldPassword = oldPassword;
    const response = await authAxios.put(`/tenant/${tenantId}/user/changeWithdrawalPassword`, body);
    return response.data;
  }

  static async getTenant() {
    const response = await authAxios.get("/single");
    return response.data.rows[0];
  }

  static async ensureTenantId(): Promise<string> {
    const existing = AuthCurrentTenant.get();
    if (existing) return existing;
    const tenant = await this.getTenant();
    AuthCurrentTenant.set(tenant);
    return tenant.id;
  }

  static signout() {
    AuthToken.set(null);
  }

  // Lets the workspace show its welcome notice once, right after sign-in or sign-up.
  static markWelcome(kind: WelcomeKind) {
    storage.setSession(storageKeys.welcome, kind);
  }

  static consumeWelcome(): WelcomeKind | null {
    const kind = storage.getSession(storageKeys.welcome);
    if (kind !== "signin" && kind !== "signup") return null;
    storage.removeSession(storageKeys.welcome);
    return kind;
  }
}
