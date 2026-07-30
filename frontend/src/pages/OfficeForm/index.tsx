import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { officeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatCRO, isValidCRO } from "../../utils/masks";
import CurrencyInput from "../../components/CurrencyInput";
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

const REQUIRED_ADDRESS_FIELDS: (keyof Address)[] = [
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
  "zipCode",
];

interface DraftService {
  id: string; // id local (client-side) para controlar a lista antes de salvar
  name: string;
  price: number;
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
  const [croTouched, setCroTouched] = useState(false);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [shiftPrices, setShiftPrices] = useState<Record<Shift, number>>({
    MANHA: 0,
    TARDE: 0,
    NOITE: 0,
  });
  // Força a remontagem dos CurrencyInput de turno quando os dados de edição
  // chegam (o valor inicial deles só é lido uma vez, no mount).
  const [shiftInputsKey, setShiftInputsKey] = useState("new");
  const [equipments, setEquipments] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [availableWeekdays, setAvailableWeekdays] = useState<Weekday[]>([]);
  const [services, setServices] = useState<DraftService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceInputKey, setNewServiceInputKey] = useState(0);
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
        // Normaliza o CRO para o novo formato "12345-SP" mesmo se o dado
        // salvo estiver no formato antigo (ex: "CRO-CE 10234"), evitando
        // que o botão de salvar fique travado por causa de dados legados.
        setCroResponsible(formatCRO(office.croResponsible));
        setAddress(office.address);
        setEquipments(office.equipments);
        setAvailableWeekdays(office.availableWeekdays ?? []);
        setServices((office.services ?? []).map((s) => ({ id: s.id, name: s.name, price: s.price })));

        const prices: Record<Shift, number> = { MANHA: 0, TARDE: 0, NOITE: 0 };
        office.shiftPrices.forEach((sp) => {
          prices[sp.shift] = sp.price;
        });
        setShiftPrices(prices);
        setShiftInputsKey(office.id); // remonta os CurrencyInput com os valores carregados
      } catch {
        setError("Não foi possível carregar os dados do consultório.");
        toast.error("Não foi possível carregar os dados do consultório.");
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
    if (!name) {
      toast.error("Informe o nome do procedimento.");
      return;
    }
    if (!newServicePrice || newServicePrice <= 0) {
      toast.error("Informe um preço válido para o procedimento.");
      return;
    }
    setServices((prev) => [...prev, { id: makeDraftId(), name, price: newServicePrice }]);
    setNewServiceName("");
    setNewServicePrice(0);
    setNewServiceInputKey((k) => k + 1); // reseta o CurrencyInput do novo procedimento
  }

  function removeService(draftId: string) {
    setServices((prev) => prev.filter((s) => s.id !== draftId));
  }

  function buildShiftPricesPayload(): ShiftPrice[] {
    return ALL_SHIFTS.filter((shift) => shiftPrices[shift] > 0).map((shift) => ({
      shift,
      price: shiftPrices[shift],
    }));
  }

  function buildServicesPayload(): OfficeService[] {
    return services.map((s) => ({ id: s.id, name: s.name, price: s.price }));
  }

  // ---------- Validação para habilitar/desabilitar o botão de salvar ----------
  const isCroValid = isValidCRO(croResponsible);
  const isAddressValid = REQUIRED_ADDRESS_FIELDS.every((field) => (address[field] || "").trim() !== "");
  const hasAtLeastOneShiftPrice = ALL_SHIFTS.some((shift) => shiftPrices[shift] > 0);
  const hasWeekday = availableWeekdays.length > 0;

  const isFormValid = useMemo(
    () =>
      title.trim() !== "" &&
      description.trim() !== "" &&
      isCroValid &&
      isAddressValid &&
      hasAtLeastOneShiftPrice &&
      hasWeekday,
    [title, description, isCroValid, isAddressValid, hasAtLeastOneShiftPrice, hasWeekday]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      // Guarda extra: o botão já vem desabilitado, mas cobrimos o caso de
      // submit via Enter no teclado.
      if (!hasAtLeastOneShiftPrice) toast.error("Informe o preço de ao menos um turno.");
      else if (!hasWeekday) toast.error("Selecione ao menos um dia da semana disponível.");
      else if (!isCroValid) toast.error("Informe um CRO válido no formato 12345-SP.");
      else toast.error("Preencha todos os campos obrigatórios antes de salvar.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para cadastrar um consultório.");
      return;
    }

    const payload: CreateOfficeDTO = {
      ownerId: user.id,
      title,
      description,
      croResponsible,
      address,
      shiftPrices: buildShiftPricesPayload(),
      equipments,
      availableWeekdays,
      services: buildServicesPayload(),
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await officeService.update(id as string, payload);
        toast.success("Consultório atualizado com sucesso!");
      } else {
        await officeService.create(payload);
        toast.success("Consultório cadastrado com sucesso!");
      }
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Erro ao salvar o consultório.";
      setError(message);
      toast.error(message);
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

          <div className={`field ${croTouched && !isCroValid ? "field-invalid" : ""}`}>
            <label>Registro CRO do responsável *</label>
            <input
              value={croResponsible}
              onChange={(e) => setCroResponsible(formatCRO(e.target.value))}
              onBlur={() => setCroTouched(true)}
              placeholder="Ex: 12345-SP"
              maxLength={9}
              required
            />
            {croTouched && !isCroValid ? (
              <p className="field-error-text">Use o formato número-UF, ex: 12345-SP.</p>
            ) : (
              <p className="helper-text">Formato: número do registro + sigla do estado (ex: 12345-SP).</p>
            )}
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
          <h2>Preço por Turno *</h2>
          <p className="helper-text">
            Deixe em R$ 0,00 os turnos indisponíveis. É obrigatório preencher ao menos um.
            Usado quando o dentista não escolhe um procedimento específico.
          </p>

          {ALL_SHIFTS.map((shift) => (
            <div className="shift-row" key={shift}>
              <label>{SHIFT_LABELS[shift]}</label>
              <CurrencyInput
                key={`${shiftInputsKey}-${shift}`}
                value={shiftPrices[shift]}
                onChange={(value) => setShiftPrices((prev) => ({ ...prev, [shift]: value }))}
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
                  <strong>
                    {s.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </strong>
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
              <CurrencyInput
                key={newServiceInputKey}
                value={newServicePrice}
                onChange={setNewServicePrice}
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
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !isFormValid}
            title={!isFormValid ? "Preencha Título, CRO, Endereço e ao menos um Preço de Turno" : undefined}
          >
            {submitting ? "Salvando..." : "Salvar Consultório"}
          </button>
        </div>
      </form>
    </div>
  );
}
