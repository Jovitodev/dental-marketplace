import { useState } from "react";
import { Office, SHIFT_LABELS } from "../../types/office";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop";

const EQUIPMENT_LABELS: Record<string, string> = {
  RAIO_X: "Com Raio-X",
  AUTOCLAVE: "Com Autoclave",
  CADEIRA_ODONTOLOGICA: "Cadeira Odontológica",
  COMPRESSOR: "Com Compressor",
  FOTOPOLIMERIZADOR: "Com Fotopolimerizador",
  AR_CONDICIONADO: "Climatizado",
  WIFI: "Com Wi-Fi",
};

function mainHighlight(office: Office): string {
  const priority = ["RAIO_X", "AUTOCLAVE", "CADEIRA_ODONTOLOGICA"];
  const found = priority.find((p) => office.equipments.includes(p));
  const key = found ?? office.equipments[0];
  return key ? EQUIPMENT_LABELS[key] ?? key.replaceAll("_", " ") : "Equipado";
}

function lowestPrice(office: Office): number | null {
  if (!office.shiftPrices.length) return null;
  return Math.min(...office.shiftPrices.map((s) => s.price));
}

interface OfficeCardProps {
  office: Office;
  /** Exibe os botões de gerenciamento (editar/ativar/excluir) — usado no dashboard do proprietário. */
  managementMode?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export default function OfficeCard({
  office,
  managementMode = false,
  onClick,
  onEdit,
  onToggleStatus,
  onDelete,
}: OfficeCardProps) {
  const [favorited, setFavorited] = useState(false);
  const price = lowestPrice(office);
  const bestShift = office.shiftPrices.find((s) => s.price === price)?.shift;

  return (
    <div className="office-card" onClick={onClick}>
      <div className="office-card-image">
        <img src={office.imageUrl || PLACEHOLDER_IMAGE} alt={office.title} loading="lazy" />

        {managementMode && (
          <span className={`office-card-badge`}>{office.status === "ATIVO" ? "Ativo" : "Inativo"}</span>
        )}

        <button
          className="fav-btn"
          aria-label="Favoritar"
          onClick={(e) => {
            e.stopPropagation();
            setFavorited((f) => !f);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21s-6.7-4.35-9.3-8.02C1.1 10.7 1.4 7.6 3.7 5.9c2.1-1.55 4.9-1.1 6.4.8L12 8.7l1.9-2c1.5-1.9 4.3-2.35 6.4-.8 2.3 1.7 2.6 4.8.99 7.08C18.7 16.65 12 21 12 21z"
              fill={favorited ? "var(--color-primary)" : "rgba(0,0,0,0.35)"}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>

      <div className="office-card-body">
        <div className="office-card-title-row">
          <h3>{office.title}</h3>
          <span className="office-card-rating">⭐ {(office.rating ?? 4.8).toFixed(1).replace(".", ",")}</span>
        </div>

        <p className="office-card-subtitle">
          {office.address.neighborhood} · {office.address.city}
        </p>

        <p className="office-card-highlight">
          {office.title.split(" ")[0]} · {mainHighlight(office)}
        </p>

        {price !== null && (
          <p className="office-card-price">
            <strong>R$ {price.toFixed(0)}</strong> / turno{bestShift ? ` (${SHIFT_LABELS[bestShift]})` : ""}
          </p>
        )}
      </div>

      {managementMode && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="edit" onClick={onEdit}>Editar</button>
          <button className="toggle" onClick={onToggleStatus}>
            {office.status === "ATIVO" ? "Desativar" : "Ativar"}
          </button>
          <button className="delete" onClick={onDelete}>Excluir</button>
        </div>
      )}
    </div>
  );
}
