import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { officeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Address,
  CreateOfficeDTO,
  EQUIPMENT_OPTIONS,
  OfficeService,
  Shift,
  SHIFT_LABELS,
  ShiftPrice,
  Weekday,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "../../types/office";

const ALL_SHIFTS: Shift[] = ["MANHA", "TARDE", "NOITE"];

const EMPTY_ADDRESS: Address = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

interface DraftService {
  id: string; // id local (client-side) para controlar a lista antes de salvar
  name: string;
  price: string;
}

function makeDraftId() {
  return Math.random().toString(36).slice(2);
}

export default function OfficeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams(); // presente somente em modo edição
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [croResponsible, setCroResponsible] = useState("");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [shiftPrices, setShiftPrices] = useState<Record<Shift, string>>({
    MANHA: "",
    TARDE: "",
    NOITE: "",
  });
  const [equipments, setEquipments] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState<Weekday[]>([]);
  const [services, setServices] = useState<DraftService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    async function loadOffice() {
      try {
        setLoading(true);
        const office = await officeService.getById(id as string);
        setTitle(office.title);
        setDescription(office.description);
        setCroResponsible(office.croResponsible);
        setAddress(office.address);
        setEquipments(office.equipments);
        setAvailableWeekdays(office.availableWeekdays ?? []);
        setServices(
          (office.services ?? []).map((s) => ({ id: s.id, name: s.name, price: String(s.price) }))
        );

        const prices: Record<Shift, string> = { MANHA: "", TARDE: "", NOITE: "" };
        office.shiftPrices.forEach((sp) => {
          prices[sp.shift] = String(sp.price);
        });
        setShiftPrices(prices);
      } catch {
        setError("Não foi possível carregar os dados do consultório.");
      } finally {
        setLoading(false);
      }
    }

    loadOffice();
  }, [id, isEditing]);

  function toggleEquipment(name: string) {
    setEquipments((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  }

  function addCustomEquipment() {
    const value = customEquipment.trim();
    if (!value) return;
    if (!equipments.includes(value)) {
      setEquipments((prev) => [...prev, value]);
    }
    setCustomEquipment("");
  }

  function toggleWeekday(day: Weekday) {
    setAvailableWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addService() {
    const name = newServiceName.trim();
    const price = Number(newServicePrice);
    if (!name) {
      setError("Informe o nome do procedimento.");
      return;
    }
    if (!newServicePrice || isNaN(price) || price <= 0) {
      setError("Informe um preço válido para o procedimento.");
      return;
    }
    setError(null);
    setServices((prev) => [...prev, { id: makeDraftId(), name, price: newServicePrice }]);
    setNewServiceName("");
    setNewServicePrice("");
  }

  function removeService(draftId: string) {
    setServices((prev) => prev.filter((s) => s.id !== draftId));
  }

  function buildShiftPricesPayload(): ShiftPrice[] {
    return ALL_SHIFTS.filter((shift) => shiftPrices[shift].trim() !== "").map((shift) => ({
      shift,
      price: Number(shiftPrices[shift]),
    }));
  }

  function buildServicesPayload(): OfficeService[] {
    return services.map((s) => ({ id: s.id, name: s.name, price: Number(s.price) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceList = buildShiftPricesPayload();
    if (priceList.length === 0) {
      setError("Informe o preço de ao menos um turno.");
      return;
    }

    if (availableWeekdays.length === 0) {
      setError("Selecione ao menos um dia da semana disponível.");
      return;
    }

    if (!user) {
      setError("Você precisa estar logado para cadastrar um consultório.");
      return;
    }

    const payload: CreateOfficeDTO = {
      ownerId: user.id,
      title,
      description,
      croResponsible,
      address,
      shiftPrices: priceList,
      equipments,
      availableWeekdays,
      services: buildServicesPayload(),
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await officeService.update(id as string, payload);
      } else {
        await officeService.create(payload);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao salvar o consultório.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando dados do consultório...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontSize: 18, margin: "16px 0" }}>
        {isEditing ? "Editar Consultório" : "Novo Consultório"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Dados Gerais</h2>

          <div className="field">
            <label>Título do anúncio *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Consultório equipado no centro"
              required
            />
          </div>

          <div className="field">
            <label>Descrição *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o espaço, diferenciais, regras de uso..."
              required
            />
          </div>

          <div className="field">
            <label>Registro CRO do responsável *</label>
            <input
              value={croResponsible}
              onChange={(e) => setCroResponsible(e.target.value)}
              placeholder="Ex: CRO-SP 12345"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Endereço</h2>

          <div className="grid-2">
            <div className="field">
              <label>Rua / Avenida *</label>
              <input
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Número *</label>
              <input
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Complemento</label>
            <input
              value={address.complement}
              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Bairro *</label>
              <input
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>CEP *</label>
              <input
                value={address.zipCode}
                onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Cidade *</label>
              <input
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>UF *</label>
              <input
                value={address.state}
                maxLength={2}
                onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Disponibilidade</h2>
          <p className="helper-text">Selecione os dias da semana em que este consultório aceita reservas.</p>

          <div className="weekday-grid">
            {WEEKDAY_ORDER.map((day) => (
              <label
                className={`weekday-chip ${availableWeekdays.includes(day) ? "selected" : ""}`}
                key={day}
              >
                <input
                  type="checkbox"
                  checked={availableWeekdays.includes(day)}
                  onChange={() => toggleWeekday(day)}
                  style={{ display: "none" }}
                />
                {WEEKDAY_LABELS[day]}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Preço por Turno</h2>
          <p className="helper-text">Deixe em branco os turnos indisponíveis. Usado quando o dentista não escolhe um procedimento específico.</p>

          {ALL_SHIFTS.map((shift) => (
            <div className="shift-row" key={shift}>
              <label>{SHIFT_LABELS[shift]}</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="R$ 0,00"
                value={shiftPrices[shift]}
                onChange={(e) =>
                  setShiftPrices((prev) => ({ ...prev, [shift]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2>Procedimentos Oferecidos</h2>
          <p className="helper-text">
            Cadastre os procedimentos que podem ser realizados neste consultório, cada um com seu próprio valor por turno.
          </p>

          {services.length > 0 && (
            <div className="service-list">
              {services.map((s) => (
                <div className="service-list-item" key={s.id}>
                  <span>{s.name}</span>
                  <strong>R$ {Number(s.price).toFixed(2)}</strong>
                  <button type="button" onClick={() => removeService(s.id)} aria-label="Remover procedimento">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Nome do procedimento</label>
              <input
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Ex: Procedimento de Canal"
              />
            </div>
            <div className="field">
              <label>Preço (R$/turno)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="Ex: 200"
              />
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={addService}>
            + Adicionar procedimento
          </button>
        </div>

        <div className="form-section">
          <h2>Equipamentos</h2>

          <div className="checkbox-grid">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <label className="checkbox-item" key={eq}>
                <input
                  type="checkbox"
                  checked={equipments.includes(eq)}
                  onChange={() => toggleEquipment(eq)}
                />
                {eq.replaceAll("_", " ")}
              </label>
            ))}
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Outro equipamento</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                placeholder="Ex: Ultrassom"
              />
              <button type="button" className="btn-secondary" onClick={addCustomEquipment}>
                Adicionar
              </button>
            </div>
          </div>

          {equipments.length > 0 && (
            <div className="equip-tags">
              {equipments.map((eq) => (
                <span className="equip-tag" key={eq}>
                  {eq.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions" style={{ marginBottom: 32 }}>
          <button type="button" className="btn-secondary" onClick={() => navigate("/dashboard")}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar Consultório"}
          </button>
        </div>
      </form>
    </div>
  );
}
