import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { officeService } from "../../services/api";
import { authService } from "../../services/auth";
import { bookingService } from "../../services/booking";
import { useAuth } from "../../context/AuthContext";
import { Office, SHIFT_LABELS, Shift, WEEKDAY_LABELS } from "../../types/office";
import { PublicHostProfile } from "../../types/user";
import EquipmentIcon, { EQUIPMENT_DISPLAY_LABELS } from "../../components/EquipmentIcon";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop";

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function OfficeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [office, setOffice] = useState<Office | null>(null);
  const [host, setHost] = useState<PublicHostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [selectedShift, setSelectedShift] = useState<Shift | "">("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const officeData = await officeService.getById(id as string);
        setOffice(officeData);

        if (officeData.shiftPrices[0]) {
          setSelectedShift(officeData.shiftPrices[0].shift);
        }

        try {
          const hostData = await authService.getPublicProfile(officeData.ownerId);
          setHost(hostData);
        } catch {
          setHost(null); // anfitrião pode não estar disponível; a página segue funcionando
        }
      } catch {
        setError("Não foi possível carregar este consultório.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const reviews = office?.reviews ?? [];
  const overallRating = useMemo(() => {
    if (office?.rating) return office.rating;
    return average(reviews.map((r) => r.rating));
  }, [office, reviews]);

  const gallery = useMemo(() => {
    const images = office?.images?.length ? office.images : office?.imageUrl ? [office.imageUrl] : [];
    const padded = [...images];
    while (padded.length < 5) padded.push(FALLBACK_IMAGE);
    return padded.slice(0, 5);
  }, [office]);

  const selectedShiftPrice = office?.shiftPrices.find((sp) => sp.shift === selectedShift)?.price;
  const selectedService = office?.services?.find((s) => s.id === selectedServiceId);
  const listedPrice = selectedService?.price ?? selectedShiftPrice;

  // Pré-preenche a oferta com o valor tabelado sempre que o dentista troca de
  // procedimento/turno, mas sem sobrescrever se ele já digitou algo manualmente
  // após a última troca (comportamento simples: reseta ao trocar seleção).
  useEffect(() => {
    if (listedPrice != null) {
      setOfferedPrice(String(listedPrice));
    }
  }, [selectedServiceId, selectedShift]);

  async function handleSendProposal() {
    setProposalError(null);
    setProposalSuccess(false);

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!office) return;

    if (!selectedDate) {
      setProposalError("Selecione uma data.");
      return;
    }
    if (!selectedShift) {
      setProposalError("Selecione um turno.");
      return;
    }
    const priceNumber = Number(offeredPrice);
    if (!offeredPrice || isNaN(priceNumber) || priceNumber <= 0) {
      setProposalError("Informe um valor de oferta válido.");
      return;
    }

    try {
      setSubmittingProposal(true);
      await bookingService.create({
        officeId: office.id,
        date: selectedDate,
        shift: selectedShift,
        serviceId: selectedServiceId || undefined,
        offeredPrice: priceNumber,
      });
      setProposalSuccess(true);
    } catch (err: any) {
      setProposalError(err?.response?.data?.message || "Erro ao enviar a proposta.");
    } finally {
      setSubmittingProposal(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando consultório...</p>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div className="container">
        <p className="error-text">{error ?? "Consultório não encontrado."}</p>
        <button className="btn-secondary" onClick={() => navigate("/")}>
          Voltar para a busca
        </button>
      </div>
    );
  }

  return (
    <div className="container details-page">
      {/* Cabeçalho */}
      <div className="details-header">
        <h1>{office.title}</h1>
        <div className="details-header-actions">
          <span className="details-rating">
            ⭐ {overallRating.toFixed(2).replace(".", ",")} · {reviews.length} avaliações
          </span>
          <button className={`save-btn ${saved ? "saved" : ""}`} onClick={() => setSaved((s) => !s)}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M12 21s-6.7-4.35-9.3-8.02C1.1 10.7 1.4 7.6 3.7 5.9c2.1-1.55 4.9-1.1 6.4.8L12 8.7l1.9-2c1.5-1.9 4.3-2.35 6.4-.8 2.3 1.7 2.6 4.8.99 7.08C18.7 16.65 12 21 12 21z"
                fill={saved ? "var(--color-primary)" : "none"}
                stroke={saved ? "var(--color-primary)" : "currentColor"}
                strokeWidth="1.6"
              />
            </svg>
            Salvar
          </button>
        </div>
      </div>

      {/* Grid de imagens: 1 grande + 4 pequenas */}
      <div className="gallery-grid">
        <div className="gallery-main">
          <img src={gallery[0]} alt={office.title} />
        </div>
        <div className="gallery-side">
          {gallery.slice(1, 5).map((src, idx) => (
            <div className="gallery-thumb" key={idx}>
              <img src={src} alt={`${office.title} - foto ${idx + 2}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Corpo: duas colunas */}
      <div className="details-body">
        <div className="details-main">
          <div className="details-summary">
            <h2>
              {office.address.neighborhood}, {office.address.city} - {office.address.state}
            </h2>
            <p className="details-meta">CRO responsável: {office.croResponsible}</p>
          </div>

          {host && (
            <div className="host-inline">
              <img src={host.avatarUrl} alt={host.name} />
              <div>
                <strong>Anfitrião: {host.name}</strong>
                <p>{host.isSuperhost ? "Superhost" : `${host.yearsHosting} anos anunciando`}</p>
              </div>
            </div>
          )}

          <hr />

          <p className="details-description">{office.description}</p>

          <hr />

          <h3>O que este consultório oferece</h3>
          <div className="amenities-grid">
            {office.equipments.map((eq) => (
              <div className="amenity-item" key={eq}>
                <EquipmentIcon equipment={eq} />
                <span>{EQUIPMENT_DISPLAY_LABELS[eq] ?? eq.replaceAll("_", " ")}</span>
              </div>
            ))}
          </div>

          <hr />

          <h3>
            ⭐ {overallRating.toFixed(2).replace(".", ",")} · {reviews.length} avaliações
          </h3>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div className="review-item" key={review.id}>
                <div className="review-author">
                  <img src={review.authorAvatarUrl} alt={review.authorName} />
                  <div>
                    <strong>{review.authorName}</strong>
                    <p>{new Date(review.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="helper-text">Ainda não há avaliações para este consultório.</p>}
          </div>

          {host && (
            <>
              <hr />
              <h3>Conheça seu anfitrião</h3>
              <div className="host-card">
                <div className="host-card-top">
                  <img src={host.avatarUrl} alt={host.name} />
                  <div>
                    <strong>{host.name}</strong>
                    <p>{host.isSuperhost ? "Superhost" : "Anfitrião"}</p>
                    <p className="helper-text">
                      {host.reviewsCount} avaliações · ⭐ {host.hostRating.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
                {host.bio && <p className="host-bio">{host.bio}</p>}
                <ul className="host-facts">
                  <li>Taxa de resposta: {host.responseRate}%</li>
                  <li>{host.responseTime}</li>
                  <li>{host.yearsHosting} anos hospedando</li>
                </ul>
                <button className="btn-secondary" onClick={() => alert("Módulo de chat ainda não implementado.")}>
                  Enviar mensagem ao anfitrião
                </button>
              </div>
            </>
          )}
        </div>

        {/* Card de proposta flutuante */}
        <aside className="booking-card">
          {proposalSuccess ? (
            <div className="proposal-success">
              <span style={{ fontSize: 28 }}>✅</span>
              <strong>Proposta enviada!</strong>
              <p className="helper-text">
                O anfitrião foi notificado e tem até 24 horas para responder. Acompanhe em "Minhas Propostas".
              </p>
              <button className="btn-secondary" style={{ width: "100%" }} onClick={() => navigate("/proposals/sent")}>
                Ver minhas propostas
              </button>
            </div>
          ) : (
            <>
              <div className="booking-price">
                <strong>R$ {listedPrice?.toFixed(2) ?? "--"}</strong> / turno
                <p className="helper-text" style={{ margin: "2px 0 0" }}>Valor tabelado — você pode propor outro abaixo</p>
              </div>

              <div className="field">
                <label>Data</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                {office.availableWeekdays?.length > 0 && (
                  <p className="helper-text">
                    Disponível: {office.availableWeekdays.map((d) => WEEKDAY_LABELS[d]).join(", ")}
                  </p>
                )}
              </div>

              <div className="field">
                <label>Turno</label>
                <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value as Shift)}>
                  <option value="" disabled>Selecione um turno</option>
                  {office.shiftPrices.map((sp) => (
                    <option key={sp.shift} value={sp.shift}>
                      {SHIFT_LABELS[sp.shift]} · R$ {sp.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {office.services && office.services.length > 0 && (
                <div className="field">
                  <label>Procedimento</label>
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                    <option value="">Turno padrão (sem procedimento específico)</option>
                    {office.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · R$ {s.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label>Sua oferta de valor (R$)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                />
                <p className="helper-text">
                  Pré-preenchido com o valor tabelado. Você pode ajustar para propor um valor diferente.
                </p>
              </div>

              {proposalError && <p className="error-text">{proposalError}</p>}

              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={handleSendProposal}
                disabled={submittingProposal}
              >
                {submittingProposal ? "Enviando..." : "Enviar Proposta"}
              </button>

              <p className="helper-text" style={{ textAlign: "center", marginTop: 8 }}>
                {isAuthenticated
                  ? "O anfitrião tem até 24 horas para responder"
                  : "Você precisa entrar na sua conta para propor uma reserva"}
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
