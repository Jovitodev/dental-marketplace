import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { officeService } from "../../services/api";
import { bookingService } from "../../services/booking";
import { useAuth } from "../../context/AuthContext";
import { Office } from "../../types/office";

/**
 * Visão geral rápida do anfitrião — complementa (sem substituir) a tela de
 * gestão detalhada de consultórios em /dashboard e a fila de propostas em
 * /proposals/received.
 */
export default function HostPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const [ownedOffices, pendingProposals] = await Promise.all([
          officeService.list({ ownerId: user!.id }),
          bookingService.listReceived("PENDENTE_APROVACAO"),
        ]);
        setOffices(ownedOffices);
        setPendingCount(pendingProposals.length);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <p>Carregando painel do anfitrião...</p>
      </div>
    );
  }

  const activeCount = offices.filter((o) => o.status === "ATIVO" && o.moderationStatus === "APROVADO").length;
  const pendingModerationCount = offices.filter((o) => o.moderationStatus === "PENDENTE").length;
  const avgRating = offices.length
    ? offices.reduce((sum, o) => sum + (o.rating ?? 0), 0) / offices.length
    : 0;

  return (
    <div className="container">
      <div className="section-title">
        <h2>Painel do Anfitrião</h2>
      </div>

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="admin-metric-value">{offices.length}</span>
          <span className="admin-metric-label">Consultórios cadastrados</span>
          <span className="admin-metric-hint">{activeCount} ativo(s) e aprovado(s)</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">{pendingCount}</span>
          <span className="admin-metric-label">Propostas aguardando resposta</span>
          <span className="admin-metric-hint">Responda em até 24 horas</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">{pendingModerationCount}</span>
          <span className="admin-metric-label">Aguardando aprovação da equipe</span>
          <span className="admin-metric-hint">Anúncios em moderação</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">
            {avgRating > 0 ? avgRating.toFixed(2).replace(".", ",") : "—"}
          </span>
          <span className="admin-metric-label">Nota média dos seus consultórios</span>
          <span className="admin-metric-hint">Baseado nas avaliações recebidas</span>
        </div>
      </div>

      <div className="host-panel-actions">
        <button className="btn-primary" onClick={() => navigate("/proposals/received")}>
          Ver Propostas Recebidas
        </button>
        <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
          Gerenciar Clínicas
        </button>
        <button className="btn-secondary" onClick={() => navigate("/offices/new")}>
          + Cadastrar novo consultório
        </button>
      </div>
    </div>
  );
}
