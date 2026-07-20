import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Logo";
import { useAuth } from "../../context/AuthContext";

/**
 * Cabeçalho do DentSpot.
 *
 * Regra de negócio do botão principal (canto superior direito):
 * - Deslogado: mostra "Entrar / Cadastrar" e leva para /auth.
 *   (o usuário só pode criar um consultório depois de ter uma conta)
 * - Logado: mostra "+ Novo" e leva direto para /offices/new.
 *
 * O link "Anuncie seu Consultório" segue a mesma regra: só aparece
 * para quem já está logado, e leva direto para /offices/new.
 */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  function handlePrimaryAction() {
    if (isAuthenticated) {
      navigate("/offices/new");
    } else {
      navigate("/auth");
    }
  }

  function handleAnnounceClick() {
    // Só é exibido quando isAuthenticated === true, mas a checagem
    // é mantida aqui como segurança extra caso o botão seja reaproveitado.
    if (isAuthenticated) {
      navigate("/offices/new");
    } else {
      navigate("/auth");
    }
  }

  function handleLogout() {
    const confirmed = window.confirm("Deseja sair da sua conta?");
    if (confirmed) {
      logout();
      navigate("/");
    }
  }

  return (
    <header className="navbar">
      <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <Logo />
      </div>

      <nav className="navbar-links">
        <span
          className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Consultórios
        </span>
        {isAuthenticated && (
          <span
            className={`navbar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            Meus Anúncios
          </span>
        )}
        {isAuthenticated && (
          <span
            className={`navbar-link ${location.pathname === "/proposals/received" ? "active" : ""}`}
            onClick={() => navigate("/proposals/received")}
          >
            Propostas Recebidas
          </span>
        )}
        {isAuthenticated && (
          <span
            className={`navbar-link ${location.pathname === "/proposals/sent" ? "active" : ""}`}
            onClick={() => navigate("/proposals/sent")}
          >
            Minhas Propostas
          </span>
        )}
        {isAuthenticated && user?.role === "admin" && (
          <span
            className={`navbar-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
            onClick={() => navigate("/admin")}
          >
            Painel Admin
          </span>
        )}
      </nav>

      <div className="navbar-right">
        {isAuthenticated && (
          <button className="btn-host" onClick={handleAnnounceClick}>
            Anuncie seu Consultório
          </button>
        )}

        <button className="btn-new" onClick={handlePrimaryAction}>
          {isAuthenticated ? "+ Novo" : "Entrar / Cadastrar"}
        </button>

        {isAuthenticated && (
          <div className="navbar-user" onClick={handleLogout} title="Clique para sair">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span className="avatar-fallback">{user?.name?.[0]?.toUpperCase()}</span>
            )}
            <span>{user?.name?.split(" ")[0]}</span>
          </div>
        )}
      </div>
    </header>
  );
}
