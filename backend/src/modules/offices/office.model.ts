// Tipos e enums do módulo de Consultórios (Offices/Rooms)
// Mantido isolado do restante do sistema para facilitar a extração
// futura para um pacote compartilhado (ex: monorepo com workspaces).

export type OfficeStatus = "ATIVO" | "INATIVO";

export type Shift = "MANHA" | "TARDE" | "NOITE";

export interface Address {
  street: string; // Rua/Avenida
  number: string;
  complement?: string;
  neighborhood: string; // Bairro
  city: string;
  state: string; // UF
  zipCode: string; // CEP
}

export interface ShiftPrice {
  shift: Shift;
  price: number; // valor em reais (R$)
}

export type Equipment =
  | "AUTOCLAVE"
  | "RAIO_X"
  | "CADEIRA_ODONTOLOGICA"
  | "COMPRESSOR"
  | "FOTOPOLIMERIZADOR"
  | "AR_CONDICIONADO"
  | "WIFI"
  | string; // permite equipamentos customizados além dos pré-definidos

export interface Review {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number; // 0-5
  comment: string;
  date: string; // ISO string
}

export interface Office {
  id: string;
  ownerId: string; // ID do Proprietário
  title: string;
  description: string;
  croResponsible: string; // Registro CRO do responsável técnico
  address: Address;
  shiftPrices: ShiftPrice[]; // Preço por turno (Manhã/Tarde/Noite)
  equipments: Equipment[];
  status: OfficeStatus;
  imageUrl?: string; // Imagem de capa (usada no card estilo Airbnb)
  images?: string[]; // Galeria de fotos (usada na tela de detalhes)
  reviews?: Review[]; // Avaliações do consultório
  rating?: number; // Avaliação média (0-5). Calculável a partir de reviews.
  createdAt: string;
  updatedAt: string;
}

// DTO usado na criação (id/createdAt/updatedAt são gerados pelo backend)
export interface CreateOfficeDTO {
  ownerId: string;
  title: string;
  description: string;
  croResponsible: string;
  address: Address;
  shiftPrices: ShiftPrice[];
  equipments: Equipment[];
  status?: OfficeStatus;
  imageUrl?: string;
  images?: string[];
  reviews?: Review[];
  rating?: number;
}

// DTO usado na atualização (todos os campos opcionais - PATCH-like)
export type UpdateOfficeDTO = Partial<CreateOfficeDTO>;
