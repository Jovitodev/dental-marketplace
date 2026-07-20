import { BookingProposal, BOOKING_STATUS_LABELS } from "../../types/booking";
import { SHIFT_LABELS } from "../../types/office";

interface ProposalCardProps {
  proposal: BookingProposal;
  /** "owner": mostra o dentista + botões de aceitar/recusar/negociar. "dentist": mostra o consultório. */
  perspective: "owner" | "dentist";
  onAccept?: () => void;
  onReject?: () => void;
  onNegotiate?: () => void;
  acting?: boolean;
}

function statusBadgeClass(status: BookingProposal["status"]): string {
  switch (status) {
    case "ACEITO":
      return "ativo";
    case "RECUSADO":
      return "inativo";
    default:
      return "pending-status";
  }
}

export default function ProposalCard({
  proposal,
  perspective,
  onAccept,
  onReject,
  onNegotiate,
  acting,
}: ProposalCardProps) {
  const formattedDate = new Date(`${proposal.date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="proposal-card">
      <div className="proposal-card-main">
        {perspective === "owner" ? (
          <img src={proposal.dentistAvatarUrl} alt={proposal.dentistName} className="proposal-avatar" />
        ) : (
          <img
            src={proposal.officeImageUrl || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop"}
            alt={proposal.officeTitle}
            className="proposal-avatar proposal-avatar-square"
          />
        )}

        <div className="proposal-card-info">
          <div className="proposal-card-title-row">
            <strong>{perspective === "owner" ? proposal.dentistName : proposal.officeTitle}</strong>
            <span className={`badge ${statusBadgeClass(proposal.status)}`}>
              {BOOKING_STATUS_LABELS[proposal.status]}
            </span>
          </div>

          {perspective === "dentist" && (
            <p className="helper-text">Proposta enviada para o anfitrião</p>
          )}

          <p className="proposal-card-detail">
            {formattedDate} ({proposal.weekday}) · {SHIFT_LABELS[proposal.shift]} · {proposal.serviceName}
          </p>

          <p className="proposal-card-price">
            Tabelado: R$ {proposal.listedPrice.toFixed(2)} · Ofertado:{" "}
            <strong>R$ {proposal.offeredPrice.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {perspective === "owner" && proposal.status !== "ACEITO" && proposal.status !== "RECUSADO" && (
        <div className="card-actions">
          <button className="edit" onClick={onAccept} disabled={acting}>
            Aceitar Oferta
          </button>
          <button className="delete" onClick={onReject} disabled={acting}>
            Recusar Oferta
          </button>
          <button className="toggle" onClick={onNegotiate} disabled={acting}>
            Negociar
          </button>
        </div>
      )}

      {(perspective === "dentist" || proposal.status === "ACEITO" || proposal.status === "RECUSADO") && (
        <div className="card-actions">
          <button className="edit" onClick={onNegotiate}>
            {proposal.messages.length > 1 ? "Ver conversa" : "Ver detalhes"}
          </button>
        </div>
      )}
    </div>
  );
}
