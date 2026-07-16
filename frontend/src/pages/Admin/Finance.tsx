import { useEffect, useState } from "react";
import { adminService, FinanceSummary } from "../../services/admin";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Finance() {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getFinanceSummary();
        setFinance(data);
      } catch {
        setError("Não foi possível carregar os dados financeiros.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Carregando painel financeiro...</p>;
  if (error || !finance) return <p className="error-text">{error}</p>;

  const maxTrend = Math.max(...finance.monthlyTrend.map((m) => m.grossRevenue), 1);

  return (
    <div>
      <h2 className="admin-section-title">Taxas e Finanças</h2>
      <p className="helper-text" style={{ marginBottom: 20 }}>
        ⚠️ Valores simulados — a plataforma ainda não possui um módulo de pagamentos real.
        Estimativa baseada em {finance.activeListingsConsidered} consultório(s) ativo(s) e aprovado(s).
      </p>

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="admin-metric-value">{finance.platformFeePercent}%</span>
          <span className="admin-metric-label">Taxa da plataforma</span>
          <span className="admin-metric-hint">Comissão sobre cada reserva</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">{formatCurrency(finance.estimatedMonthlyGrossRevenue)}</span>
          <span className="admin-metric-label">Faturamento bruto estimado/mês</span>
          <span className="admin-metric-hint">Soma de todos os anúncios ativos</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">{formatCurrency(finance.platformFeeRevenue)}</span>
          <span className="admin-metric-label">Receita da plataforma/mês</span>
          <span className="admin-metric-hint">Comissão retida pelo DentSpot</span>
        </div>
        <div className="admin-metric-card">
          <span className="admin-metric-value">{formatCurrency(finance.hostPayoutTotal)}</span>
          <span className="admin-metric-label">Repasse aos anfitriões/mês</span>
          <span className="admin-metric-hint">Após dedução da taxa</span>
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Tendência dos últimos 6 meses (simulada)</h3>
      <div className="finance-bar-chart">
        {finance.monthlyTrend.map((m, idx) => (
          <div className="finance-bar-wrapper" key={idx}>
            <div
              className="finance-bar"
              style={{ height: `${Math.max((m.grossRevenue / maxTrend) * 100, 4)}%` }}
              title={formatCurrency(m.grossRevenue)}
            />
            <span className="finance-bar-label">M{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
