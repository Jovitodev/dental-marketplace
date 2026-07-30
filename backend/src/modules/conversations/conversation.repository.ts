import { Conversation } from "./conversation.model";

export interface IConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findByParticipant(userId: string): Promise<Conversation[]>;
  // Evita duplicar threads: se o dentista já conversou com este anfitrião
  // sobre este mesmo consultório, a mensagem entra na conversa existente.
  findExisting(dentistId: string, ownerId: string, officeId: string): Promise<Conversation | null>;
  update(id: string, patch: Partial<Conversation>): Promise<Conversation | null>;
}

class ConversationInMemoryRepository implements IConversationRepository {
  private conversations: Conversation[] = [];

  async create(conversation: Conversation): Promise<Conversation> {
    this.conversations.push(conversation);
    return conversation;
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.find((c) => c.id === id) ?? null;
  }

  async findByParticipant(userId: string): Promise<Conversation[]> {
    return this.conversations
      .filter((c) => c.dentistId === userId || c.ownerId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async findExisting(dentistId: string, ownerId: string, officeId: string): Promise<Conversation | null> {
    return (
      this.conversations.find(
        (c) => c.dentistId === dentistId && c.ownerId === ownerId && c.officeId === officeId
      ) ?? null
    );
  }

  async update(id: string, patch: Partial<Conversation>): Promise<Conversation | null> {
    const index = this.conversations.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.conversations[index] = {
      ...this.conversations[index],
      ...patch,
      id: this.conversations[index].id,
      updatedAt: new Date().toISOString(),
    };
    return this.conversations[index];
  }
}

export const conversationRepository: IConversationRepository = new ConversationInMemoryRepository();
