import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/user";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Se informado, exige que o usuário logado tenha exatamente essa role. */
  requiredRole?: UserRole;
}

/**
 * Bloqueia o acesso a rotas que exigem autenticação (e, opcionalmente,
 * uma role específica — usado para proteger o módulo /admin).
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
