import { useState } from "react";
import Overview from "./Overview";
import UsersManagement from "./Users";
import Moderation from "./Moderation";
import Finance from "./Finance";

type AdminSection = "overview" | "users" | "moderation" | "finance";

const SECTIONS: { key: AdminSection; label: string; icon: string }[] = [
  { key: "overview", label: "Visão Geral", icon: "📊" },
  { key: "users", label: "Gestão de Usuários", icon: "👥" },
  { key: "moderation", label: "Moderação de Clínicas", icon: "🏥" },
  { key: "finance", label: "Taxas e Finanças", icon: "💰" },
];

/**
 * Painel administrativo do DentSpot.
 * Acesso restrito a usuários com role "admin" — ver <ProtectedRoute> em App.tsx.
 */
export default function Admin() {
  const [section, setSection] = useState<AdminSection>("overview");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Painel Admin</h2>
        <nav>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`admin-sidebar-item ${section === s.key ? "active" : ""}`}
              onClick={() => setSection(s.key)}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        {section === "overview" && <Overview />}
        {section === "users" && <UsersManagement />}
        {section === "moderation" && <Moderation />}
        {section === "finance" && <Finance />}
      </main>
    </div>
  );
}
