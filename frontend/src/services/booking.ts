import { api } from "./api";
import { BookingProposal, CreateBookingPayload } from "../types/booking";

export const bookingService = {
  async create(payload: CreateBookingPayload): Promise<BookingProposal> {
    const { data } = await api.post<BookingProposal>("/bookings", payload);
    return data;
  },

  async listReceived(status?: string): Promise<BookingProposal[]> {
    const { data } = await api.get<BookingProposal[]>("/bookings/received", { params: { status } });
    return data;
  },

  async listSent(status?: string): Promise<BookingProposal[]> {
    const { data } = await api.get<BookingProposal[]>("/bookings/sent", { params: { status } });
    return data;
  },

  async getById(id: string): Promise<BookingProposal> {
    const { data } = await api.get<BookingProposal>(`/bookings/${id}`);
    return data;
  },

  async accept(id: string): Promise<BookingProposal> {
    const { data } = await api.patch<BookingProposal>(`/bookings/${id}/accept`);
    return data;
  },

  async reject(id: string): Promise<BookingProposal> {
    const { data } = await api.patch<BookingProposal>(`/bookings/${id}/reject`);
    return data;
  },

  async sendMessage(id: string, text: string): Promise<BookingProposal> {
    const { data } = await api.post<BookingProposal>(`/bookings/${id}/messages`, { text });
    return data;
  },
};
