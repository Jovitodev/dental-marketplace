import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { officeService } from "../../services/api";
import { favoritesService } from "../../services/favorites";
import { Office } from "../../types/office";
import OfficeCard from "../../components/OfficeCard";

export default function Favorites() {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ids = favoritesService.list();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          ids.map((id) => officeService.getById(id).catch(() => null))
        );
        setOffices(results.filter((o): o is Office => o !== null));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container">
      <div className="section-title">
        <h2>Favoritos</h2>
      </div>

      {loading && <p>Carregando favoritos...</p>}

      {!loading && offices.length === 0 && (
        <div className="empty-state">
          <p>
            Você ainda não favoritou nenhum consultório. Toque no coração de um anúncio para
            salvá-lo aqui.
          </p>
        </div>
      )}

      <div className="office-grid">
        {offices.map((office) => (
          <OfficeCard key={office.id} office={office} onClick={() => navigate(`/offices/${office.id}`)} />
        ))}
      </div>
    </div>
  );
}
