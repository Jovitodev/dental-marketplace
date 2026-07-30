import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Logo";
import ProfileMenu from "../ProfileMenu";
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
 *
 * Os destinos pessoais (Meus Anúncios, Propostas, Mensagens, Favoritos...)
 * vivem no menu suspenso de perfil (ProfileMenu), não na navbar — mesmo
 * padrão do Airbnb, onde a barra superior fica enxuta e o menu do avatar
 * concentra a navegação pessoal.
 */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

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

        {isAuthenticated && <ProfileMenu />}
      </div>
    </header>
  );
}
