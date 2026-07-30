import { Shift, Weekday } from "./office";
import { ChatMessage } from "./chat";

export type BookingStatus = "PENDENTE_APROVACAO" | "ACEITO" | "RECUSADO" | "NEGOCIACAO";

export type { ChatMessage };

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDENTE_APROVACAO: "Aguardando aprovação",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  NEGOCIACAO: "Em negociação",
};

export interface BookingProposal {
  id: string;
  officeId: string;
  officeTitle: string;
  officeImageUrl?: string;
  ownerId: string;
  dentistId: string;
  dentistName: string;
  dentistAvatarUrl: string;
  date: string;
  weekday: Weekday;
  shift: Shift;
  serviceId?: string;
  serviceName: string;
  listedPrice: number;
  offeredPrice: number;
  status: BookingStatus;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  officeId: string;
  date: string;
  shift: Shift;
  serviceId?: string;
  offeredPrice: number;
}
