import { Shift, Weekday } from "../offices/office.model";
import { ChatMessage } from "../../shared/types/chat";

// Status do ciclo de vida de uma proposta de reserva.
export type BookingStatus = "PENDENTE_APROVACAO" | "ACEITO" | "RECUSADO" | "NEGOCIACAO";

export type { ChatMessage };

export interface BookingProposal {
  id: string;
  officeId: string;
  officeTitle: string; // denormalizado para não precisar de outro fetch na listagem
  officeImageUrl?: string;
  ownerId: string; // proprietário do consultório — quem recebe a proposta
  dentistId: string; // quem está propondo a reserva
  dentistName: string;
  dentistAvatarUrl: string;
  date: string; // "YYYY-MM-DD"
  weekday: Weekday;
  shift: Shift;
  serviceId?: string;
  serviceName: string; // ex: "Procedimento de Canal" ou "Turno padrão"
  listedPrice: number; // preço tabelado (do serviço ou do turno) no momento da proposta
  offeredPrice: number; // valor efetivamente ofertado pelo dentista
  status: BookingStatus;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDTO {
  officeId: string;
  date: string; // "YYYY-MM-DD"
  shift: Shift;
  serviceId?: string;
  offeredPrice: number;
}
