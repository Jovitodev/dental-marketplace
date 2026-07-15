import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { officeService } from "../../services/api";
import {
  Address,
  CreateOfficeDTO,
  EQUIPMENT_OPTIONS,
  Shift,
  SHIFT_LABELS,
  ShiftPrice,
} from "../../types/office";

// TODO(auth): substituir pelo ID do proprietário autenticado.
const CURRENT_OWNER_ID = "owner-demo-01";

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

export default function OfficeForm() {
  const navigate = useNavigate();
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

  function buildShiftPricesPayload(): ShiftPrice[] {
    return ALL_SHIFTS.filter((shift) => shiftPrices[shift].trim() !== "").map((shift) => ({
      shift,
      price: Number(shiftPrices[shift]),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceList = buildShiftPricesPayload();
    if (priceList.length === 0) {
      setError("Informe o preço de ao menos um turno.");
      return;
    }

    const payload: CreateOfficeDTO = {
      ownerId: CURRENT_OWNER_ID,
      title,
      description,
      croResponsible,
      address,
      shiftPrices: priceList,
      equipments,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await officeService.update(id as string, payload);
      } else {
        await officeService.create(payload);
      }
      navigate("/");
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
          <h2>Preço por Turno</h2>
          <p className="helper-text">Deixe em branco os turnos indisponíveis.</p>

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
          <button type="button" className="btn-secondary" onClick={() => navigate("/")}>
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
