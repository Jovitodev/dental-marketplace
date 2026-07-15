import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Logo from "./components/Logo";
import Home from "./pages/Home";
import OfficeList from "./pages/OfficeList";
import OfficeForm from "./pages/OfficeForm";
import OfficeDetails from "./pages/OfficeDetails";
import Auth from "./pages/Auth";
import { useAuth } from "./context/AuthContext";

// Layout raiz + definição de rotas.
// Para novos módulos (ex: /chat, /reviews), adicione novas <Route> aqui
// e crie as respectivas pastas em src/pages.

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

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
      </nav>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <button className="btn-host" onClick={() => navigate("/dashboard")}>
              Anuncie seu Consultório
            </button>
            <div
              className="navbar-user"
              onClick={() => {
                const confirmed = window.confirm("Deseja sair da sua conta?");
                if (confirmed) {
                  logout();
                  navigate("/");
                }
              }}
              title="Clique para sair"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span className="avatar-fallback">{user?.name?.[0]?.toUpperCase()}</span>
              )}
              <span>{user?.name?.split(" ")[0]}</span>
            </div>
          </>
        ) : (
          <button className="btn-new" onClick={() => navigate("/auth")}>
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<OfficeList />} />
        <Route path="/offices/new" element={<OfficeForm />} />
        <Route path="/offices/:id" element={<OfficeDetails />} />
        <Route path="/offices/:id/edit" element={<OfficeForm />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
