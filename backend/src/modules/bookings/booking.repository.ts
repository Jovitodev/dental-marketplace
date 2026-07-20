import { BookingProposal } from "./booking.model";

export interface IBookingRepository {
  create(booking: BookingProposal): Promise<BookingProposal>;
  findById(id: string): Promise<BookingProposal | null>;
  findByOwner(ownerId: string, status?: string): Promise<BookingProposal[]>;
  findByDentist(dentistId: string, status?: string): Promise<BookingProposal[]>;
  // Procura propostas do mesmo dentista, na mesma data/turno, com status
  // PENDENTE_APROVACAO ou ACEITO — usado para a regra de conflito de agenda.
  findActiveConflict(
    dentistId: string,
    date: string,
    shift: string,
    excludeBookingId?: string
  ): Promise<BookingProposal | null>;
  update(id: string, patch: Partial<BookingProposal>): Promise<BookingProposal | null>;
}

class BookingInMemoryRepository implements IBookingRepository {
  private bookings: BookingProposal[] = [];

  async create(booking: BookingProposal): Promise<BookingProposal> {
    this.bookings.push(booking);
    return booking;
  }

  async findById(id: string): Promise<BookingProposal | null> {
    return this.bookings.find((b) => b.id === id) ?? null;
  }

  async findByOwner(ownerId: string, status?: string): Promise<BookingProposal[]> {
    let result = this.bookings.filter((b) => b.ownerId === ownerId);
    if (status) result = result.filter((b) => b.status === status);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByDentist(dentistId: string, status?: string): Promise<BookingProposal[]> {
    let result = this.bookings.filter((b) => b.dentistId === dentistId);
    if (status) result = result.filter((b) => b.status === status);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findActiveConflict(
    dentistId: string,
    date: string,
    shift: string,
    excludeBookingId?: string
  ): Promise<BookingProposal | null> {
    return (
      this.bookings.find(
        (b) =>
          b.dentistId === dentistId &&
          b.date === date &&
          b.shift === shift &&
          (b.status === "PENDENTE_APROVACAO" || b.status === "ACEITO") &&
          b.id !== excludeBookingId
      ) ?? null
    );
  }

  async update(id: string, patch: Partial<BookingProposal>): Promise<BookingProposal | null> {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    this.bookings[index] = {
      ...this.bookings[index],
      ...patch,
      id: this.bookings[index].id,
      updatedAt: new Date().toISOString(),
    };
    return this.bookings[index];
  }
}

export const bookingRepository: IBookingRepository = new BookingInMemoryRepository();
