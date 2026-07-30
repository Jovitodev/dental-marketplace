import { useEffect, useState } from "react";
import { bookingService } from "../../services/booking";
import { conversationService } from "../../services/conversation";
import { BookingProposal, BOOKING_STATUS_LABELS } from "../../types/booking";
import { Conversation } from "../../types/conversation";
import { useAuth } from "../../context/AuthContext";
import ProposalChat from "../../components/ProposalChat";
import ConversationChat from "../../components/ConversationChat";

type Thread =
  | { kind: "booking"; id: string; data: BookingProposal }
  | { kind: "conversation"; id: string; data: Conversation };

function lastMessageOf(thread: Thread) {
  const messages = thread.data.messages;
  return messages[messages.length - 1] ?? null;
}

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openBooking, setOpenBooking] = useState<BookingProposal | null>(null);
  const [openConversation, setOpenConversation] = useState<Conversation | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [sent, received, conversations] = await Promise.all([
        bookingService.listSent(),
        bookingService.listReceived(),
        conversationService.list(),
      ]);

      // Uma proposta pode aparecer tanto em "sent" quanto em "received" se o
      // usuário for dentista e anfitrião ao mesmo tempo em contextos
      // diferentes — mas para um único usuário, cada proposta só vem de um
      // dos dois endpoints (ele é ou o dentista ou o dono, nunca os dois na
      // mesma proposta). Ainda assim, deduplicamos por segurança.
      const bookingMap = new Map<string, BookingProposal>();
      [...sent, ...received].forEach((b) => bookingMap.set(b.id, b));

      const bookingThreads: Thread[] = Array.from(bookingMap.values()).map((b) => ({
        kind: "booking",
        id: b.id,
        data: b,
      }));
      const conversationThreads: Thread[] = conversations.map((c) => ({
        kind: "conversation",
        id: c.id,
        data: c,
      }));

      const all = [...bookingThreads, ...conversationThreads].sort((a, b) => {
        const aTime = new Date(lastMessageOf(a)?.createdAt ?? a.data.updatedAt).getTime();
        const bTime = new Date(lastMessageOf(b)?.createdAt ?? b.data.updatedAt).getTime();
        return bTime - aTime;
      });

      setThreads(all);
    } catch {
      setError("Não foi possível carregar suas mensagens.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateBooking(updated: BookingProposal) {
    setThreads((prev) =>
      prev.map((t) => (t.kind === "booking" && t.id === updated.id ? { ...t, data: updated } : t))
    );
    setOpenBooking(updated);
  }

  function updateConversation(updated: Conversation) {
    setThreads((prev) =>
      prev.map((t) => (t.kind === "conversation" && t.id === updated.id ? { ...t, data: updated } : t))
    );
    setOpenConversation(updated);
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando mensagens...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Mensagens</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!error && threads.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não tem nenhuma conversa. Envie uma proposta ou uma mensagem para um anfitrião.</p>
        </div>
      )}

      <div className="message-thread-list">
        {threads.map((thread) => {
          const lastMessage = lastMessageOf(thread);
          const isBooking = thread.kind === "booking";
          const counterpartName = isBooking
            ? (thread.data as BookingProposal).ownerId === user?.id
              ? (thread.data as BookingProposal).dentistName
              : "Anfitrião"
            : (thread.data as Conversation).dentistId === user?.id
              ? (thread.data as Conversation).ownerName
              : (thread.data as Conversation).dentistName;
          const officeTitle = isBooking
            ? (thread.data as BookingProposal).officeTitle
            : (thread.data as Conversation).officeTitle;
          const imageUrl = isBooking
            ? (thread.data as BookingProposal).officeImageUrl
            : (thread.data as Conversation).officeImageUrl;

          return (
            <button
              key={`${thread.kind}-${thread.id}`}
              className="message-thread-item"
              onClick={() =>
                isBooking
                  ? setOpenBooking(thread.data as BookingProposal)
                  : setOpenConversation(thread.data as Conversation)
              }
            >
              <img
                src={imageUrl || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop"}
                alt={officeTitle}
              />
              <div className="message-thread-info">
                <div className="message-thread-title-row">
                  <strong>{counterpartName}</strong>
                  {isBooking && (
                    <span className="badge pending-status">
                      {BOOKING_STATUS_LABELS[(thread.data as BookingProposal).status]}
                    </span>
                  )}
                </div>
                <p className="helper-text">{officeTitle}</p>
                {lastMessage && (
                  <p className="message-thread-preview">
                    {lastMessage.isAutoGenerated ? "📋 " : ""}
                    {lastMessage.text.split("\n")[0]}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {openBooking && (
        <ProposalChat
          proposal={openBooking}
          onClose={() => setOpenBooking(null)}
          onUpdated={updateBooking}
        />
      )}

      {openConversation && (
        <ConversationChat
          conversation={openConversation}
          onClose={() => setOpenConversation(null)}
          onUpdated={updateConversation}
        />
      )}
    </div>
  );
}
