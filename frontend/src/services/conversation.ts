import { api } from "./api";
import { Conversation, StartConversationPayload } from "../types/conversation";

export const conversationService = {
  async start(payload: StartConversationPayload): Promise<Conversation> {
    const { data } = await api.post<Conversation>("/conversations", payload);
    return data;
  },

  async list(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>("/conversations");
    return data;
  },

  async getById(id: string): Promise<Conversation> {
    const { data } = await api.get<Conversation>(`/conversations/${id}`);
    return data;
  },

  async sendMessage(id: string, text: string): Promise<Conversation> {
    const { data } = await api.post<Conversation>(`/conversations/${id}/messages`, { text });
    return data;
  },
};
