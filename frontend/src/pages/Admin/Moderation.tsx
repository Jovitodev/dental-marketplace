import { useEffect, useState } from "react";
import { adminService } from "../../services/admin";
import { Office } from "../../types/office";

export default function Moderation() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.listPendingOffices();
      setOffices(data);
    } catch {
      setError("Não foi possível carregar os anúncios pendentes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    try {
      setActingId(id);
      await adminService.approveOffice(id);
      setOffices((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Erro ao aprovar o consultório.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja recusar este anúncio?");
    if (!confirmed) return;

    try {
      setActingId(id);
      await adminService.rejectOffice(id);
      setOffices((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Erro ao recusar o consultório.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <p>Carregando anúncios pendentes...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Moderação de Clínicas</h2>

      {offices.length === 0 && (
        <div className="empty-state">
          <p>Nenhum anúncio aguardando aprovação no momento. 🎉</p>
        </div>
      )}

      <div className="admin-moderation-list">
        {offices.map((office) => (
          <div className="admin-moderation-card" key={office.id}>
            <img src={office.imageUrl} alt={office.title} />
            <div className="admin-moderation-info">
              <strong>{office.title}</strong>
              <p>
                {office.address.neighborhood}, {office.address.city} - {office.address.state}
              </p>
              <p className="helper-text">CRO: {office.croResponsible}</p>
              <p className="helper-text">
                {office.equipments.length} equipamento(s) · {office.shiftPrices.length} turno(s) cadastrado(s)
              </p>
            </div>
            <div className="admin-moderation-actions">
              <button
                className="btn-primary"
                disabled={actingId === office.id}
                onClick={() => handleApprove(office.id)}
              >
                Aprovar
              </button>
              <button
                className="btn-secondary danger"
                disabled={actingId === office.id}
                onClick={() => handleReject(office.id)}
              >
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
