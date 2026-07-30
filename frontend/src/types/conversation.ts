import { ChatMessage } from "./chat";

export interface Conversation {
  id: string;
  officeId: string;
  officeTitle: string;
  officeImageUrl?: string;
  dentistId: string;
  dentistName: string;
  dentistAvatarUrl: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StartConversationPayload {
  officeId: string;
  text: string;
}
