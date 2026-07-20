import { useEffect, useState } from "react";
import { bookingService } from "../../../services/booking";
import { BookingProposal } from "../../../types/booking";
import ProposalCard from "../../../components/ProposalCard";
import ProposalChat from "../../../components/ProposalChat";

export default function SentProposals() {
  const [proposals, setProposals] = useState<BookingProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatProposal, setChatProposal] = useState<BookingProposal | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.listSent();
      setProposals(data);
    } catch {
      setError("Não foi possível carregar suas propostas.");
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

  if (loading) {
    return (
      <div className="container">
        <p>Carregando suas propostas...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Minhas Propostas</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!error && proposals.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não enviou nenhuma proposta de reserva.</p>
        </div>
      )}

      <div className="proposal-list">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            perspective="dentist"
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
