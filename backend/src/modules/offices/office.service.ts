import { CreateOfficeDTO, Office, UpdateOfficeDTO } from "./office.model";
import { officeRepository } from "./office.repository";

// Camada de Serviço: concentra as regras de negócio (validações,
// autorizações, cálculos) e conversa com o repositório.
// O controller nunca deve acessar o repositório diretamente.

export class OfficeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfficeValidationError";
  }
}

function validateCreateDTO(data: CreateOfficeDTO) {
  if (!data.ownerId?.trim()) throw new OfficeValidationError("ownerId é obrigatório.");
  if (!data.title?.trim()) throw new OfficeValidationError("title é obrigatório.");
  if (!data.description?.trim()) throw new OfficeValidationError("description é obrigatório.");
  if (!data.croResponsible?.trim()) throw new OfficeValidationError("croResponsible é obrigatório.");
  if (!data.address) throw new OfficeValidationError("address é obrigatório.");
  if (!data.shiftPrices || data.shiftPrices.length === 0) {
    throw new OfficeValidationError("Informe ao menos um turno com preço (shiftPrices).");
  }
  data.shiftPrices.forEach((sp) => {
    if (sp.price < 0) throw new OfficeValidationError("O preço do turno não pode ser negativo.");
  });
  if (!data.equipments) throw new OfficeValidationError("equipments é obrigatório (pode ser lista vazia).");
  if (!data.availableWeekdays || data.availableWeekdays.length === 0) {
    throw new OfficeValidationError("Selecione ao menos um dia da semana disponível.");
  }
  if (!data.services) throw new OfficeValidationError("services é obrigatório (pode ser lista vazia).");
  data.services.forEach((s) => {
    if (!s.name?.trim()) throw new OfficeValidationError("Todo procedimento precisa de um nome.");
    if (s.price < 0) throw new OfficeValidationError("O preço do procedimento não pode ser negativo.");
  });
}

export const officeService = {
  async create(data: CreateOfficeDTO): Promise<Office> {
    validateCreateDTO(data);
    // Segurança: todo consultório nasce PENDENTE, independentemente do
    // que vier no corpo da requisição — só um admin pode aprovar.
    return officeRepository.create({ ...data, moderationStatus: "PENDENTE" });
  },

  async list(filters?: { ownerId?: string; status?: string; moderationStatus?: string }): Promise<Office[]> {
    return officeRepository.findAll(filters);
  },

  async getById(id: string): Promise<Office> {
    const office = await officeRepository.findById(id);
    if (!office) throw new OfficeValidationError("Consultório não encontrado.");
    return office;
  },

  async update(id: string, data: UpdateOfficeDTO): Promise<Office> {
    if (data.shiftPrices) {
      data.shiftPrices.forEach((sp) => {
        if (sp.price < 0) throw new OfficeValidationError("O preço do turno não pode ser negativo.");
      });
    }
    const updated = await officeRepository.update(id, data);
    if (!updated) throw new OfficeValidationError("Consultório não encontrado.");
    return updated;
  },

  async toggleStatus(id: string): Promise<Office> {
    const office = await officeRepository.findById(id);
    if (!office) throw new OfficeValidationError("Consultório não encontrado.");
    const newStatus = office.status === "ATIVO" ? "INATIVO" : "ATIVO";
    const updated = await officeRepository.update(id, { status: newStatus });
    return updated as Office;
  },

  async remove(id: string): Promise<void> {
    const deleted = await officeRepository.delete(id);
    if (!deleted) throw new OfficeValidationError("Consultório não encontrado.");
  },

  // ---------- Moderação (usado pelo painel /admin) ----------

  async listPending(): Promise<Office[]> {
    return officeRepository.findAll({ moderationStatus: "PENDENTE" });
  },

  async approve(id: string): Promise<Office> {
    const updated = await officeRepository.update(id, { moderationStatus: "APROVADO" });
    if (!updated) throw new OfficeValidationError("Consultório não encontrado.");
    return updated;
  },

  async reject(id: string): Promise<Office> {
    const updated = await officeRepository.update(id, { moderationStatus: "RECUSADO" });
    if (!updated) throw new OfficeValidationError("Consultório não encontrado.");
    return updated;
  },
};
