import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIsHost } from "../../hooks/useIsHost";

interface MenuItem {
  label: string;
  onClick: () => void;
  icon: string;
}

/**
 * Botão de avatar + menu suspenso (popover), inspirado no menu de perfil do
 * Airbnb. As opções mudam dinamicamente conforme o usuário já tenha (ou não)
 * consultórios anunciados — ver useIsHost para a lógica de detecção, coerente
 * com o modelo de cadastro único (qualquer pessoa pode ser dentista e/ou
 * anfitrião com a mesma conta).
 */
export default function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isHost } = useIsHost();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setOpen(false);
    const confirmed = window.confirm("Deseja sair da sua conta?");
    if (confirmed) {
      logout();
      navigate("/");
    }
  }

  const dentistItems: MenuItem[] = [
    { label: "Favoritos", icon: "♡", onClick: () => go("/favorites") },
    { label: "Viagens", icon: "🧳", onClick: () => go("/proposals/sent") },
    { label: "Mensagens", icon: "💬", onClick: () => go("/messages") },
    { label: "Perfil", icon: "👤", onClick: () => go("/profile") },
    { label: "Central de Ajuda", icon: "❓", onClick: () => go("/help") },
  ];

  const hostItems: MenuItem[] = [
    { label: "Painel do Anfitrião", icon: "🏠", onClick: () => go("/host") },
    { label: "Gerenciar Clínicas", icon: "🏥", onClick: () => go("/dashboard") },
    { label: "Propostas Recebidas", icon: "📋", onClick: () => go("/proposals/received") },
    { label: "Mensagens", icon: "💬", onClick: () => go("/messages") },
  ];

  const primaryItems = isHost ? hostItems : dentistItems;

  return (
    <div className="profile-menu" ref={containerRef}>
      <button className="navbar-user" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} />
        ) : (
          <span className="avatar-fallback">{user?.name?.[0]?.toUpperCase()}</span>
        )}
        <span>{user?.name?.split(" ")[0]}</span>
      </button>

      {open && (
        <div className="profile-menu-dropdown" role="menu">
          <div className="profile-menu-block">
            {primaryItems.map((item) => (
              <button key={item.label} className="profile-menu-item" onClick={item.onClick} role="menuitem">
                <span className="profile-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="profile-menu-divider" />

          <div className="profile-menu-block">
            <button className="profile-menu-item" onClick={handleLogout} role="menuitem">
              <span className="profile-menu-icon">🚪</span>
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
