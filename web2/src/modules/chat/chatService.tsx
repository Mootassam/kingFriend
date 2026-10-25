import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

export interface ChatConversation {
  id: string;
  status: "open" | "closed";
}

export interface ChatMessage {
  id: string;
  senderType: "admin" | "customer";
  type: "text" | "image";
  text?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface ChatSettings {
  chatWidgetTitle?: string;
  chatAllowReopenClosed?: boolean;
}

// Same endpoints as PC's live chat.
export default class ChatService {
  // Gets the customer's conversation, creating it (and the greeting message) on first use.
  static async myConversation(): Promise<ChatConversation> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/chat/conversation`);
    return response.data;
  }

  static async listMessages(conversationId: string, { limit = 0, offset = 0 } = {}): Promise<{ rows: ChatMessage[] }> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  }

  static async sendMessage(
    conversationId: string,
    data: { type: "text"; text: string } | { type: "image"; attachmentUrl: string },
  ): Promise<ChatMessage> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(`/tenant/${tenantId}/chat/conversations/${conversationId}/messages`, { data });
    return response.data;
  }

  static async getSettings(): Promise<ChatSettings> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/settings`);
    return response.data;
  }
}
