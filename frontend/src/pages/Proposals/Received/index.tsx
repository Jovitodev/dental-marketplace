import { useEffect, useState } from "react";
import { bookingService } from "../../../services/booking";
import { BookingProposal } from "../../../types/booking";
import ProposalCard from "../../../components/ProposalCard";
import ProposalChat from "../../../components/ProposalChat";

export default function ReceivedProposals() {
  const [proposals, setProposals] = useState<BookingProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [chatProposal, setChatProposal] = useState<BookingProposal | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.listReceived();
      setProposals(data);
    } catch {
      setError("Não foi possível carregar as propostas recebidas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(updated: BookingProposal) {
    setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setChatProposal((prev) => (prev?.id === updated.id ? updated : prev));
  }

  async function handleAccept(id: string) {
    try {
      setActingId(id);
      const updated = await bookingService.accept(id);
      updateLocal(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erro ao aceitar a proposta.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja recusar esta proposta?");
    if (!confirmed) return;

    try {
      setActingId(id);
      const updated = await bookingService.reject(id);
      updateLocal(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erro ao recusar a proposta.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando propostas...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Propostas Recebidas</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!error && proposals.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não recebeu nenhuma proposta de reserva.</p>
        </div>
      )}

      <div className="proposal-list">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            perspective="owner"
            acting={actingId === proposal.id}
            onAccept={() => handleAccept(proposal.id)}
            onReject={() => handleReject(proposal.id)}
            onNegotiate={() => setChatProposal(proposal)}
          />
        ))}
      </div>

      {chatProposal && (
        <ProposalChat
          proposal={chatProposal}
          onClose={() => setChatProposal(null)}
          onUpdated={updateLocal}
        />
      )}
    </div>
  );
}
