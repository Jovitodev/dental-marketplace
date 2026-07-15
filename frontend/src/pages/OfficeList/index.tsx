import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { officeService } from "../../services/api";
import { Office } from "../../types/office";
import OfficeCard from "../../components/OfficeCard";

// TODO(auth): substituir pelo ID do proprietário autenticado quando o
// módulo de autenticação for implementado.
const CURRENT_OWNER_ID = "owner-demo-01";

export default function OfficeList() {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOffices() {
    try {
      setLoading(true);
      setError(null);
      const data = await officeService.list({ ownerId: CURRENT_OWNER_ID });
      setOffices(data);
    } catch (err) {
      setError("Não foi possível carregar os consultórios. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffices();
  }, []);

  async function handleToggleStatus(id: string) {
    try {
      const updated = await officeService.toggleStatus(id);
      setOffices((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch {
      alert("Erro ao alterar o status do consultório.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este consultório?");
    if (!confirmed) return;

    try {
      await officeService.remove(id);
      setOffices((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Erro ao excluir o consultório.");
    }
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Meus Consultórios</h2>
        <button className="btn-new" onClick={() => navigate("/offices/new")}>
          + Novo
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && offices.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não cadastrou nenhum consultório.</p>
          <button className="btn-primary" onClick={() => navigate("/offices/new")}>
            Cadastrar primeiro consultório
          </button>
        </div>
      )}

      <div className="office-grid">
        {offices.map((office) => (
          <OfficeCard
            key={office.id}
            office={office}
            managementMode
            onEdit={() => navigate(`/offices/${office.id}/edit`)}
            onToggleStatus={() => handleToggleStatus(office.id)}
            onDelete={() => handleDelete(office.id)}
          />
        ))}
      </div>
    </div>
  );
}
