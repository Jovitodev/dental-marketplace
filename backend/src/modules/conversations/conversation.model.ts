import { ChatMessage } from "../../shared/types/chat";

// Uma "Conversation" representa um chat direto entre um dentista e o
// proprietário de um consultório, iniciado a partir da página de detalhes
// ("Enviar mensagem ao anfitrião"), sem estar vinculado a nenhuma proposta
// de reserva específica. Por isso vive num módulo próprio, separado de
// "bookings" (que tem seu próprio chat embutido em cada proposta).
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

export interface StartConversationDTO {
  officeId: string;
  text: string;
}
