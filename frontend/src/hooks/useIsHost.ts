import { useEffect, useState } from "react";
import { officeService } from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * No cadastro único, não existe uma "role" fixa de dentista vs. proprietário —
 * qualquer usuário pode ser os dois. Este hook decide dinamicamente qual
 * versão do menu de perfil mostrar: se o usuário já anunciou ao menos um
 * consultório, tratamos a experiência como "modo anfitrião"; caso contrário,
 * como "modo dentista" (o padrão para quem só busca/reserva).
 */
export function useIsHost(): { isHost: boolean; loading: boolean } {
  const { user, isAuthenticated } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsHost(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    officeService
      .list({ ownerId: user.id })
      .then((offices) => {
        if (!cancelled) setIsHost(offices.length > 0);
      })
      .catch(() => {
        if (!cancelled) setIsHost(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated]);

  return { isHost, loading };
}
