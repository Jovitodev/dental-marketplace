import { useState } from "react";

interface CurrencyInputProps {
  /** Valor numérico puro (ex: 250.5) — é isso que o componente reporta via onChange. */
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

function centsToDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  const numeric = clean === "" ? 0 : parseInt(clean, 10);
  const value = numeric / 100;
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Campo de preço com máscara de moeda brasileira em tempo real (ex: "R$ 250,00"),
 * usando a técnica "dígitos = centavos": cada tecla digitada empurra os dígitos
 * da direita para a esquerda, como em caixas eletrônicos e apps bancários.
 * O componente sempre reporta ao pai o valor numérico puro (250.5), nunca a
 * string formatada — a formatação é só visual.
 *
 * Para resetar o valor exibido a partir de fora (ex: ao carregar um consultório
 * para edição, ou ao limpar o campo após adicionar um procedimento), monte o
 * componente com uma prop `key` diferente — isso força o React a recriá-lo
 * com o novo valor inicial.
 */
export default function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  id,
  required,
  className,
}: CurrencyInputProps) {
  const [digits, setDigits] = useState(() => Math.round((value || 0) * 100).toString());

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawDigits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDigits(rawDigits);
    onChange(rawDigits === "" ? 0 : parseInt(rawDigits, 10) / 100);
  }

  return (
    <div className={`currency-input ${className ?? ""}`}>
      <span className="currency-input-prefix">R$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={centsToDisplay(digits)}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
