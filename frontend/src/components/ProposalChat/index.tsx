import { bookingService } from "../../services/booking";
import { BookingProposal } from "../../types/booking";
import ChatModal from "../ChatModal";

interface ProposalChatProps {
  proposal: BookingProposal;
  onClose: () => void;
  onUpdated: (updated: BookingProposal) => void;
}

/**
 * Wrapper de ChatModal especializado no chat embutido em UMA proposta de
 * reserva (inclui a mensagem automática estruturada gerada ao enviar a
 * proposta). Para o chat direto sem proposta associada, ver ConversationChat.
 */
export default function ProposalChat({ proposal, onClose, onUpdated }: ProposalChatProps) {
  async function handleSend(text: string) {
    const updated = await bookingService.sendMessage(proposal.id, text);
    onUpdated(updated);
  }

  return (
    <ChatModal
      title={`Negociação — ${proposal.officeTitle}`}
      subtitle={`${proposal.dentistName} · ${new Date(`${proposal.date}T12:00:00`).toLocaleDateString("pt-BR")}`}
      messages={proposal.messages}
      onClose={onClose}
      onSend={handleSend}
    />
  );
}
