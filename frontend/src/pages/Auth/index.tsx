import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Mode = "login" | "register";

/**
 * Cadastro único: qualquer usuário autenticado pode tanto buscar
 * consultórios quanto anunciar o seu próprio — não há tipos de conta
 * separados (dentista-locatário vs. proprietário).
 */
export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Não foi possível concluir. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Acesse sua conta para buscar ou anunciar um consultório."
            : "Um único cadastro te permite buscar e também anunciar seu consultório."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="field">
              <label>Nome completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {mode === "register" && <p className="helper-text">Mínimo de 6 caracteres.</p>}
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Enviando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <span onClick={() => setMode("register")}>Cadastre-se</span>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <span onClick={() => setMode("login")}>Entrar</span>
            </>
          )}
        </p>

        {mode === "login" && (
          <p className="auth-hint">
            Dica: use <strong>paula@example.com</strong> / <strong>123456</strong> para testar
            com um anfitrião já cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
