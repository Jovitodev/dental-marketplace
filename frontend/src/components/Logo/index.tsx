interface LogoProps {
  /** Nome da marca exibido ao lado do ícone. Passe "" para exibir só o ícone. */
  appName?: string;
  /** Altura do ícone em pixels. */
  size?: number;
  /** Cor do ícone/texto. Por padrão usa a cor primária da marca. */
  color?: string;
}

/**
 * Ícone híbrido "dente + pin de localização":
 * - O contorno geral segue a silhueta de um pin de mapa (como no Airbnb),
 *   mas o topo tem duas cúspides e um sulco central (como a coroa de um dente)
 *   e a base afunila em uma única raiz (a "ponta" do pin).
 * - Um recorte circular no centro reforça a leitura de "pin de localização".
 */
export default function Logo({ appName = "DentSpot", size = 32, color }: LogoProps) {
  const fill = color || "var(--color-primary, #0A8491)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo DentSpot"
        role="img"
      >
        <path
          d="M30,26
             C31,14 41,9 50,17
             C59,9 69,14 70,26
             C86,32 90,50 79,62
             C71,71 63,73 59,81
             C57,87 54,93 50,97
             C46,93 43,87 41,81
             C37,73 29,71 21,62
             C10,50 14,32 30,26
             Z"
          fill={fill}
        />
        <circle cx="50" cy="40" r="9" fill="white" />
      </svg>
      {appName && (
        <span
          style={{
            fontSize: Math.round(size * 0.62),
            fontWeight: 800,
            color: fill,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {appName}
        </span>
      )}
    </div>
  );
}
