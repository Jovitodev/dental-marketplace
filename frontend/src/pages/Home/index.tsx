import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar, { SearchFilters } from "../../components/SearchBar";
import OfficeCard from "../../components/OfficeCard";
import { officeService } from "../../services/api";
import { Office } from "../../types/office";

/**
 * Página pública de descoberta de consultórios (equivalente à Home do Airbnb).
 * Exibe a barra de pesquisa flutuante + grid de cards de consultórios ativos.
 */
export default function Home() {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ location: "", date: "", shift: "" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await officeService.list({ status: "ATIVO" });
        setOffices(data);
      } catch {
        setError("Não foi possível carregar os consultórios. Verifique se a API está rodando.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchesLocation = filters.location
        ? `${office.address.city} ${office.address.neighborhood}`
            .toLowerCase()
            .includes(filters.location.toLowerCase())
        : true;

      const matchesShift = filters.shift
        ? office.shiftPrices.some((sp) => sp.shift === filters.shift)
        : true;

      return matchesLocation && matchesShift;
    });
  }, [offices, filters]);

  const highlightCity = filters.location || "Fortaleza";

  return (
    <>
      <SearchBar onSearch={setFilters} />

      <div className="container">
        <div className="section-title">
          <h2>Consultórios muito procurados em {highlightCity}</h2>
        </div>

        {loading && <p>Carregando consultórios...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && filteredOffices.length === 0 && (
          <div className="empty-state">
            <p>Nenhum consultório encontrado para essa busca.</p>
          </div>
        )}

        <div className="office-grid">
          {filteredOffices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              onClick={() => navigate(`/offices/${office.id}`)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
