// Tipos do módulo de Consultórios no frontend.
// Espelham o backend (src/modules/offices/office.model.ts).
// Quando o backend mudar o contrato, atualize aqui também
// (ou futuramente extraia para um pacote "shared" em um monorepo).

export type OfficeStatus = "ATIVO" | "INATIVO";
export type ModerationStatus = "PENDENTE" | "APROVADO" | "RECUSADO";
export type Shift = "MANHA" | "TARDE" | "NOITE";

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ShiftPrice {
  shift: Shift;
  price: number;
}

export const EQUIPMENT_OPTIONS = [
  "AUTOCLAVE",
  "RAIO_X",
  "CADEIRA_ODONTOLOGICA",
  "COMPRESSOR",
  "FOTOPOLIMERIZADOR",
  "AR_CONDICIONADO",
  "WIFI",
] as const;

export type Equipment = string;

export interface Review {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Office {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  croResponsible: string;
  address: Address;
  shiftPrices: ShiftPrice[];
  equipments: Equipment[];
  status: OfficeStatus;
  moderationStatus?: ModerationStatus;
  imageUrl?: string;
  images?: string[];
  reviews?: Review[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeDTO {
  ownerId: string;
  title: string;
  description: string;
  croResponsible: string;
  address: Address;
  shiftPrices: ShiftPrice[];
  equipments: Equipment[];
  status?: OfficeStatus;
  moderationStatus?: ModerationStatus;
  imageUrl?: string;
  images?: string[];
  reviews?: Review[];
  rating?: number;
}

export type UpdateOfficeDTO = Partial<CreateOfficeDTO>;

export const SHIFT_LABELS: Record<Shift, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};
