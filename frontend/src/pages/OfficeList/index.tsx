import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { officeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Office } from "../../types/office";
import OfficeCard from "../../components/OfficeCard";

export default function OfficeList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOffices() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await officeService.list({ ownerId: user.id });
      setOffices(data);
    } catch (err) {
      setError("Não foi possível carregar os consultórios. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffices();
  }, [user]);

  async function handleToggleStatus(id: string) {
    try {
      const updated = await officeService.toggleStatus(id);
      setOffices((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success(updated.status === "ATIVO" ? "Consultório ativado." : "Consultório desativado.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao alterar o status do consultório.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este consultório?");
    if (!confirmed) return;

    try {
      await officeService.remove(id);
      setOffices((prev) => prev.filter((o) => o.id !== id));
      toast.success("Consultório excluído.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao excluir o consultório.");
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
