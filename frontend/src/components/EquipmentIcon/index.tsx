interface EquipmentIconProps {
  equipment: string;
  size?: number;
}

const STROKE = "currentColor";

function IconChair() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 4v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 14v3M16 14v3M6 21l1-4M18 21l-1-4" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.4" fill={STROKE} />
    </svg>
  );
}

function IconXray() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={STROKE} strokeWidth="1.6" />
      <path d="M12 3v18M3 12h18" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="2.5" fill={STROKE} />
    </svg>
  );
}

function IconAutoclave() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="7" width="16" height="13" rx="2" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="12" cy="13.5" r="3.2" stroke={STROKE} strokeWidth="1.6" />
      <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke={STROKE} strokeWidth="1.6" />
    </svg>
  );
}

function IconCompressor() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="12" height="8" rx="1.5" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="18" cy="14" r="3.2" stroke={STROKE} strokeWidth="1.6" />
      <path d="M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke={STROKE} strokeWidth="1.6" />
    </svg>
  );
}

function IconCuringLight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v3M4.2 6.2l2 2M2 13h3M19 13h3M17.8 8.2l2-2" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13a4 4 0 1 1 8 0c0 2-1.5 3-1.5 5h-5c0-2-1.5-3-1.5-5Z" stroke={STROKE} strokeWidth="1.6" />
      <path d="M9.5 21h5" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconAc() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="7" rx="1.5" stroke={STROKE} strokeWidth="1.6" />
      <path d="M6 15l-1.5 4M11 15l-1 4M16 15l1.5 4" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconWifi() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 8.5a15 15 0 0 1 20 0" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 12.5a10 10 0 0 1 13 0" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 16.3a5 5 0 0 1 6 0" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="19.5" r="1.3" fill={STROKE} />
    </svg>
  );
}

function IconDefault() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={STROKE} strokeWidth="1.6" />
      <path d="M12 8v4l3 2" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_MAP: Record<string, () => JSX.Element> = {
  CADEIRA_ODONTOLOGICA: IconChair,
  RAIO_X: IconXray,
  AUTOCLAVE: IconAutoclave,
  COMPRESSOR: IconCompressor,
  FOTOPOLIMERIZADOR: IconCuringLight,
  AR_CONDICIONADO: IconAc,
  WIFI: IconWifi,
};

export default function EquipmentIcon({ equipment, size = 24 }: EquipmentIconProps) {
  const IconComponent = ICON_MAP[equipment] ?? IconDefault;
  return (
    <span style={{ display: "inline-flex", width: size, height: size, color: "var(--color-text)" }}>
      <IconComponent />
    </span>
  );
}

export const EQUIPMENT_DISPLAY_LABELS: Record<string, string> = {
  CADEIRA_ODONTOLOGICA: "Cadeira odontológica",
  RAIO_X: "Aparelho de Raio-X",
  AUTOCLAVE: "Autoclave para esterilização",
  COMPRESSOR: "Compressor de ar",
  FOTOPOLIMERIZADOR: "Fotopolimerizador",
  AR_CONDICIONADO: "Ar-condicionado",
  WIFI: "Wi-Fi",
};
