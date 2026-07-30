// Máscara e validação do registro de CRO (Conselho Regional de Odontologia).
// Formato exigido: números seguidos da sigla do estado, ex: "12345-SP".

/**
 * Formata o valor digitado no padrão "NNNNN-UF" em tempo real:
 * mantém apenas dígitos e letras, usa os dígitos como número do registro
 * (até 6) e as letras como sigla do estado (até 2), sempre maiúsculas.
 */
export function formatCRO(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const digits = clean.replace(/[^0-9]/g, "").slice(0, 6);
  // Usa as ÚLTIMAS 2 letras (não as primeiras): isso garante que texto no
  // formato antigo "CRO-CE 10234" também converta corretamente para
  // "10234-CE" (a sigla do estado é sempre o que vem por último), em vez
  // de capturar acidentalmente o "CR" do prefixo "CRO".
  const letters = clean.replace(/[^A-Z]/g, "").slice(-2);

  if (!digits) return "";
  return letters ? `${digits}-${letters}` : digits;
}

// Exige de 4 a 6 dígitos, um hífen, e exatamente 2 letras (sigla do estado).
export const CRO_PATTERN = /^\d{4,6}-[A-Z]{2}$/;

export function isValidCRO(value: string): boolean {
  return CRO_PATTERN.test(value);
}
