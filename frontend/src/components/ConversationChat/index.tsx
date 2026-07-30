import { conversationService } from "../../services/conversation";
import { Conversation } from "../../types/conversation";
import { useAuth } from "../../context/AuthContext";
import ChatModal from "../ChatModal";

interface ConversationChatProps {
  conversation: Conversation;
  onClose: () => void;
  onUpdated: (updated: Conversation) => void;
}

export default function ConversationChat({ conversation, onClose, onUpdated }: ConversationChatProps) {
  const { user } = useAuth();
  const otherPartyName = user?.id === conversation.dentistId ? conversation.ownerName : conversation.dentistName;

  async function handleSend(text: string) {
    const updated = await conversationService.sendMessage(conversation.id, text);
    onUpdated(updated);
  }

  return (
    <ChatModal
      title={`${otherPartyName} — ${conversation.officeTitle}`}
      subtitle="Conversa direta sobre este consultório"
      messages={conversation.messages}
      onClose={onClose}
      onSend={handleSend}
    />
  );
}
