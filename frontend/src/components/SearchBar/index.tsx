import { FormEvent, useState } from "react";
import { Shift } from "../../types/office";

export interface SearchFilters {
  location: string;
  date: string;
  shift: Shift | "";
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

/**
 * Barra de pesquisa com 3 campos + botão de lupa redondo,
 * seguindo a estrutura visual do Airbnb (Onde / Quando / Quem),
 * adaptada para o nicho: Onde / Quando / Período (turno).
 */
export default function SearchBar({ onSearch, initialFilters }: SearchBarProps) {
  const [location, setLocation] = useState(initialFilters?.location ?? "");
  const [date, setDate] = useState(initialFilters?.date ?? "");
  const [shift, setShift] = useState<Shift | "">(initialFilters?.shift ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({ location, date, shift });
  }

  return (
    <div className="searchbar-wrapper">
      <form className="searchbar" onSubmit={handleSubmit}>
        <div className="searchbar-field">
          <label htmlFor="search-where">Onde</label>
          <input
            id="search-where"
            type="text"
            placeholder="Buscar cidades ou bairros"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="searchbar-field">
          <label htmlFor="search-when">Quando</label>
          <input
            id="search-when"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="searchbar-field">
          <label htmlFor="search-shift">Período</label>
          <select
            id="search-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift | "")}
          >
            <option value="">Qualquer turno</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>
        </div>

        <div className="searchbar-submit">
          <button type="submit" aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
