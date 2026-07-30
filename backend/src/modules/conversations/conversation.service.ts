import { randomUUID } from "crypto";
import { officeRepository } from "../offices/office.repository";
import { userRepository } from "../users/user.repository";
import { ChatMessage } from "../../shared/types/chat";
import { Conversation, StartConversationDTO } from "./conversation.model";
import { conversationRepository } from "./conversation.repository";

export class ConversationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversationValidationError";
  }
}

export const conversationService = {
  // Dispara a mensagem para o repositório em memória, simulando o início
  // (ou continuação) de uma conversa de chat entre dentista e proprietário.
  async startOrContinue(dentistId: string, data: StartConversationDTO): Promise<Conversation> {
    if (!data.officeId) throw new ConversationValidationError("officeId é obrigatório.");
    if (!data.text?.trim()) throw new ConversationValidationError("A mensagem não pode ficar vazia.");

    const office = await officeRepository.findById(data.officeId);
    if (!office) throw new ConversationValidationError("Consultório não encontrado.");

    if (office.ownerId === dentistId) {
      throw new ConversationValidationError("Você não pode enviar uma mensagem para o seu próprio consultório.");
    }

    const dentist = await userRepository.findById(dentistId);
    const owner = await userRepository.findById(office.ownerId);
    if (!dentist || !owner) throw new ConversationValidationError("Usuário não encontrado.");

    const message: ChatMessage = {
      id: randomUUID(),
      senderId: dentistId,
      senderName: dentist.name,
      text: data.text.trim(),
      createdAt: new Date().toISOString(),
    };

    const existing = await conversationRepository.findExisting(dentistId, office.ownerId, office.id);
    if (existing) {
      const updated = await conversationRepository.update(existing.id, {
        messages: [...existing.messages, message],
      });
      return updated as Conversation;
    }

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: randomUUID(),
      officeId: office.id,
      officeTitle: office.title,
      officeImageUrl: office.imageUrl,
      dentistId: dentist.id,
      dentistName: dentist.name,
      dentistAvatarUrl: dentist.avatarUrl,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerAvatarUrl: owner.avatarUrl,
      messages: [message],
      createdAt: now,
      updatedAt: now,
    };

    return conversationRepository.create(conversation);
  },

  async getById(id: string): Promise<Conversation> {
    const conversation = await conversationRepository.findById(id);
    if (!conversation) throw new ConversationValidationError("Conversa não encontrada.");
    return conversation;
  },

  async listForUser(userId: string): Promise<Conversation[]> {
    return conversationRepository.findByParticipant(userId);
  },

  async addMessage(id: string, senderId: string, text: string): Promise<Conversation> {
    const conversation = await this.getById(id);
    if (senderId !== conversation.dentistId && senderId !== conversation.ownerId) {
      throw new ConversationValidationError("Você não participa desta conversa.");
    }
    if (!text?.trim()) throw new ConversationValidationError("Mensagem vazia.");

    const sender = await userRepository.findById(senderId);
    const message: ChatMessage = {
      id: randomUUID(),
      senderId,
      senderName: sender?.name ?? "Usuário",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = await conversationRepository.update(id, {
      messages: [...conversation.messages, message],
    });
    return updated as Conversation;
  },
};
