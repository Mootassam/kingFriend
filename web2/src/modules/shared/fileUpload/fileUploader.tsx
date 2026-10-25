import axios from "axios";
import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

export interface FileStorageConfig {
  id: string;
  maxSizeInBytes: number;
}

// Must match the storage ids in the server's src/security/storage.ts.
export const fileStorages = {
  chatAttachments: { id: "chatAttachments", maxSizeInBytes: 10 * 1024 * 1024 },
  // Same storage PC uses for KYC documents.
  categoryPhoto: { id: "categoryPhoto", maxSizeInBytes: 100 * 1024 * 1024 },
};

const extensionOf = (filename: string) => {
  const match = /(?:\.([^.]+))?$/.exec(filename || "");
  return (match?.[1] || "png").toLowerCase();
};

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// Same two-step flow as PC: ask the server for upload credentials, then post the file to them.
export default class FileUploader {
  static validate(file: File, config: { storage: FileStorageConfig; image?: boolean }) {
    if (config.image && !file.type.startsWith("image")) {
      throw new Error("Please choose an image file.");
    }
    if (file.size > config.storage.maxSizeInBytes) {
      throw new Error(`The file is too big (max ${Math.round(config.storage.maxSizeInBytes / 1024 / 1024)} MB).`);
    }
  }

  static async upload(file: File, config: { storage: FileStorageConfig; image?: boolean }) {
    this.validate(file, config);

    const filename = `${randomId()}.${extensionOf(file.name)}`;
    const tenantId = AuthCurrentTenant.get();
    const { data } = await authAxios.get(`/tenant/${tenantId}/file/credentials`, {
      params: { filename, storageId: config.storage.id },
    });

    const formData = new FormData();
    for (const [key, value] of Object.entries(data.uploadCredentials?.fields || {})) {
      formData.append(key, value as string);
    }
    formData.append("file", file);
    await axios.post(data.uploadCredentials.url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Same shape as PC, which is what the server's file fields store.
    return {
      name: file.name,
      sizeInBytes: file.size,
      privateUrl: data.privateUrl as string,
      publicUrl: (data.uploadCredentials?.publicUrl as string) || null,
      downloadUrl: data.downloadUrl as string,
      new: true as const,
    };
  }
}
