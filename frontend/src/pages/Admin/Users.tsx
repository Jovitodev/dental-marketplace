import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminService } from "../../services/admin";
import { User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.listUsers();
      setUsers(data);
    } catch {
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleBan(id: string) {
    try {
      setActingId(id);
      const updated = await adminService.toggleBanUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(updated.status === "BANIDO" ? "Usuário banido." : "Usuário reativado.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao alterar o status do usuário.");
    } finally {
      setActingId(null);
    }
  }

  async function handleTogglePromote(id: string) {
    try {
      setActingId(id);
      const updated = await adminService.togglePromoteUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(updated.role === "admin" ? "Usuário promovido a admin." : "Permissão de admin removida.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao alterar a permissão do usuário.");
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <p>Carregando usuários...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Gestão de Usuários</h2>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Role</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="admin-user-cell">
                    <img src={u.avatarUrl} alt={u.name} />
                    <span>{u.name}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "admin" ? "ativo" : ""}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.status === "ATIVO" ? "ativo" : "inativo"}`}>{u.status}</span>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      className="btn-secondary"
                      disabled={actingId === u.id || u.id === currentUser?.id}
                      onClick={() => handleTogglePromote(u.id)}
                      title={u.id === currentUser?.id ? "Você não pode alterar sua própria role" : undefined}
                    >
                      {u.role === "admin" ? "Remover admin" : "Promover a admin"}
                    </button>
                    <button
                      className="btn-secondary danger"
                      disabled={actingId === u.id || u.id === currentUser?.id}
                      onClick={() => handleToggleBan(u.id)}
                      title={u.id === currentUser?.id ? "Você não pode banir a si mesmo" : undefined}
                    >
                      {u.status === "ATIVO" ? "Banir" : "Reativar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
