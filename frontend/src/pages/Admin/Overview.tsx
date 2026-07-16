import { useEffect, useState } from "react";
import { adminService, AdminMetrics } from "../../services/admin";

export default function Overview() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getMetrics();
        setMetrics(data);
      } catch {
        setError("Não foi possível carregar as métricas.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Carregando métricas...</p>;
  if (error || !metrics) return <p className="error-text">{error}</p>;

  const cards = [
    { label: "Usuários totais", value: metrics.totalUsers, hint: `${metrics.totalAdmins} admin(s)` },
    { label: "Usuários banidos", value: metrics.bannedUsers, hint: "Contas suspensas" },
    { label: "Consultórios totais", value: metrics.totalOffices, hint: "Cadastrados na plataforma" },
    { label: "Consultórios ativos", value: metrics.activeOffices, hint: "Aprovados e visíveis" },
    { label: "Aguardando aprovação", value: metrics.pendingOffices, hint: "Na fila de moderação" },
    { label: "Recusados", value: metrics.rejectedOffices, hint: "Reprovados pela moderação" },
    { label: "Avaliações totais", value: metrics.totalReviews, hint: "Somadas de todos os consultórios" },
    { label: "Nota média", value: metrics.averageRating.toFixed(2).replace(".", ","), hint: "Entre todos os consultórios" },
  ];

  return (
    <div>
      <h2 className="admin-section-title">Visão Geral</h2>
      <div className="admin-metrics-grid">
        {cards.map((c) => (
          <div className="admin-metric-card" key={c.label}>
            <span className="admin-metric-value">{c.value}</span>
            <span className="admin-metric-label">{c.label}</span>
            <span className="admin-metric-hint">{c.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
