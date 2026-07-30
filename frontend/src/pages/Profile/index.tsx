import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container">
      <div className="section-title">
        <h2>Perfil</h2>
      </div>

      <div className="profile-card">
        <div className="profile-card-top">
          <img src={user.avatarUrl} alt={user.name} />
          <div>
            <strong>{user.name}</strong>
            <p className="helper-text">{user.email}</p>
          </div>
        </div>

        {user.bio && <p className="host-bio">{user.bio}</p>}

        <ul className="host-facts">
          <li>{user.isSuperhost ? "Superhost" : "Membro"} desde {user.yearsHosting > 0 ? `${user.yearsHosting} anos` : "recentemente"}</li>
          <li>{user.reviewsCount} avaliações recebidas</li>
          <li>Nota média: ⭐ {user.hostRating > 0 ? user.hostRating.toFixed(2).replace(".", ",") : "sem avaliações ainda"}</li>
        </ul>

        <p className="helper-text">
          A edição de perfil ainda não está disponível nesta versão — em breve você poderá atualizar
          sua foto, bio e dados de contato por aqui.
        </p>
      </div>
    </div>
  );
}
