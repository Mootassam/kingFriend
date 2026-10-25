import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

export type KycStatus = "success" | "pending" | "unverified";

export type DocumentType = "passport" | "idCard" | "driversLicense";

export interface UploadedFile {
  name: string;
  sizeInBytes: number;
  privateUrl: string;
  publicUrl: string | null;
  downloadUrl: string;
  new: true;
}

export interface KycSubmission {
  Documenttype: DocumentType;
  realname: string;
  idnumer: string;
  address: string;
  front: UploadedFile[];
  back: UploadedFile[];
}

export interface KycRecord {
  _id: string;
  status: "pending" | "canceled" | "success";
  createdAt: string;
}

export default class KycService {
  // Same body as PC. The server field names (Documenttype, idnumer) are spelled as the server expects.
  static async create(user: { id: string }, submission: KycSubmission) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(`/tenant/${tenantId}/kyc`, {
      data: { ...submission, user: { id: user.id, _id: user.id }, status: "pending" },
    });
    return response.data;
  }

  // Latest KYC submission of this user. The filter is required: without it the server
  // returns every submission in the tenant.
  static async latest(userId: string): Promise<KycRecord | null> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/kyc`, {
      params: { filter: { user: userId }, orderBy: "createdAt_DESC", limit: 1 },
    });
    return response.data.rows?.[0] || null;
  }
}
