import { randomUUID } from "crypto";
import {
  CreateOfficeDTO,
  Office,
  Review,
  UpdateOfficeDTO,
} from "./office.model";

// Repositório em memória (mock). Quando o banco de dados real for
// definido (Postgres, Mongo, etc), basta criar uma nova implementação
// desta mesma interface (ex: OfficePrismaRepository) e trocar a
// instância usada no controller/service, sem alterar o restante do módulo.

export interface IOfficeRepository {
  create(data: CreateOfficeDTO): Promise<Office>;
  findAll(filters?: { ownerId?: string; status?: string }): Promise<Office[]>;
  findById(id: string): Promise<Office | null>;
  update(id: string, data: UpdateOfficeDTO): Promise<Office | null>;
  delete(id: string): Promise<boolean>;
}

function makeReview(
  authorName: string,
  authorAvatarUrl: string,
  rating: number,
  comment: string,
  date: string
): Review {
  return { id: randomUUID(), authorName, authorAvatarUrl, rating, comment, date };
}

class OfficeInMemoryRepository implements IOfficeRepository {
  private offices: Office[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const demo: Array<Omit<Office, "id" | "createdAt" | "updatedAt">> = [
      {
        ownerId: "owner-demo-01",
        title: "Consultório Meireles",
        description:
          "Sala climatizada, próxima à praia, ideal para atendimentos clínicos gerais. Espaço planejado para transmitir conforto e confiança aos pacientes, com acabamento moderno e fácil acesso.",
        croResponsible: "CRO-CE 10234",
        address: { street: "Av. Beira Mar", number: "1200", neighborhood: "Meireles", city: "Fortaleza", state: "CE", zipCode: "60165-121" },
        shiftPrices: [{ shift: "MANHA", price: 250 }, { shift: "TARDE", price: 250 }],
        equipments: ["RAIO_X", "AUTOCLAVE", "AR_CONDICIONADO", "WIFI"],
        status: "ATIVO",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909613645-a3e0e1c3d3a3?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop",
        ],
        reviews: [
          makeReview("Rayane", "https://i.pravatar.cc/100?img=47", 5, "Paula é uma querida — super simpática e acolhedora. Me senti realmente em casa. A localização é excelente, com tudo por perto.", "2026-05-02"),
          makeReview("Adilson Oliveira", "https://i.pravatar.cc/100?img=12", 4, "Ótima localização perto de tudo. Local tranquilo, me senti em casa e a Paula é super simpática. Voltarei em breve.", "2026-04-18"),
          makeReview("Terra", "https://i.pravatar.cc/100?img=32", 4, "A acomodação foi incrível, assim como toda a comunicação durante a estadia. Fica próximo de praticamente tudo.", "2026-05-10"),
          makeReview("Vitória", "https://i.pravatar.cc/100?img=25", 5, "Ótimo ambiente, cheguei em horário desconfortável mas fui prontamente recebida. Organizado e próximo de onde eu queria.", "2026-04-01"),
        ],
        rating: 4.9,
      },
      {
        ownerId: "owner-demo-02",
        title: "Studio Odonto Aldeota",
        description:
          "Consultório compacto e moderno, ótimo para ortodontia e clínica geral. Prédio com fácil acesso e estacionamento nas proximidades.",
        croResponsible: "CRO-CE 88452",
        address: { street: "Rua Barão de Aracati", number: "540", neighborhood: "Aldeota", city: "Fortaleza", state: "CE", zipCode: "60115-081" },
        shiftPrices: [{ shift: "TARDE", price: 180 }, { shift: "NOITE", price: 200 }],
        equipments: ["CADEIRA_ODONTOLOGICA", "AUTOCLAVE", "WIFI"],
        status: "ATIVO",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512099192594-08b6017fc78d?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=800&auto=format&fit=crop",
        ],
        reviews: [
          makeReview("Bruno Costa", "https://i.pravatar.cc/100?img=15", 5, "Espaço muito bem cuidado, o Marcelo foi super atencioso e prestativo durante toda a locação.", "2026-03-22"),
          makeReview("Larissa Melo", "https://i.pravatar.cc/100?img=44", 4, "Consultório funcional, bem localizado. Recomendo para quem está começando a clínica.", "2026-02-14"),
        ],
        rating: 4.7,
      },
      {
        ownerId: "owner-demo-01",
        title: "Clínica Praia do Futuro I",
        description:
          "Espaço amplo com equipamentos completos para cirurgia e implantodontia. Estrutura pensada para procedimentos mais complexos, com sala de esterilização própria.",
        croResponsible: "CRO-CE 55210",
        address: { street: "Av. Zezé Diogo", number: "3400", neighborhood: "Praia do Futuro", city: "Fortaleza", state: "CE", zipCode: "60181-901" },
        shiftPrices: [{ shift: "MANHA", price: 300 }, { shift: "TARDE", price: 300 }, { shift: "NOITE", price: 260 }],
        equipments: ["RAIO_X", "AUTOCLAVE", "COMPRESSOR", "FOTOPOLIMERIZADOR", "AR_CONDICIONADO"],
        status: "ATIVO",
        imageUrl: "https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=800&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512099192594-08b6017fc78d?q=80&w=800&auto=format&fit=crop",
        ],
        reviews: [
          makeReview("Fernanda Lima", "https://i.pravatar.cc/100?img=5", 5, "Estrutura excelente para cirurgias, equipamentos completos e bem conservados. Superou expectativas.", "2026-05-20"),
          makeReview("Diego Farias", "https://i.pravatar.cc/100?img=8", 5, "Sala espaçosa, ótima para procedimentos mais longos. Paula sempre disponível para qualquer dúvida.", "2026-04-30"),
          makeReview("Isabela Prado", "https://i.pravatar.cc/100?img=29", 4, "Muito bom custo-benefício considerando os equipamentos disponíveis no local.", "2026-03-11"),
        ],
        rating: 4.91,
      },
      {
        ownerId: "owner-demo-03",
        title: "Consultório Serrinha",
        description:
          "Casa adaptada, ambiente tranquilo, ótima para atendimentos particulares. Bairro calmo e de fácil estacionamento na rua.",
        croResponsible: "CRO-CE 33012",
        address: { street: "Rua das Acácias", number: "88", neighborhood: "Serrinha", city: "Fortaleza", state: "CE", zipCode: "60741-030" },
        shiftPrices: [{ shift: "MANHA", price: 210 }, { shift: "TARDE", price: 210 }],
        equipments: ["CADEIRA_ODONTOLOGICA", "WIFI"],
        status: "ATIVO",
        imageUrl: "https://images.unsplash.com/photo-1629909613645-a3e0e1c3d3a3?q=80&w=800&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1629909613645-a3e0e1c3d3a3?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop",
        ],
        reviews: [
          makeReview("Patrícia Nunes", "https://i.pravatar.cc/100?img=9", 5, "Ambiente muito acolhedor e tranquilo, ótimo para quem busca privacidade no atendimento.", "2026-05-05"),
          makeReview("Renato Alves", "https://i.pravatar.cc/100?img=51", 5, "Camila é muito atenciosa, espaço limpo e organizado. Recomendo bastante.", "2026-04-22"),
        ],
        rating: 4.96,
      },
    ];

    demo.forEach((office) => {
      const now = new Date().toISOString();
      this.offices.push({ id: randomUUID(), createdAt: now, updatedAt: now, ...office });
    });
  }

  async create(data: CreateOfficeDTO): Promise<Office> {
    const now = new Date().toISOString();
    const office: Office = {
      id: randomUUID(),
      status: data.status ?? "ATIVO",
      images: data.images ?? (data.imageUrl ? [data.imageUrl] : []),
      reviews: data.reviews ?? [],
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.offices.push(office);
    return office;
  }

  async findAll(filters?: { ownerId?: string; status?: string }): Promise<Office[]> {
    let result = [...this.offices];

    if (filters?.ownerId) {
      result = result.filter((o) => o.ownerId === filters.ownerId);
    }

    if (filters?.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<Office | null> {
    return this.offices.find((o) => o.id === id) ?? null;
  }

  async update(id: string, data: UpdateOfficeDTO): Promise<Office | null> {
    const index = this.offices.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const updated: Office = {
      ...this.offices[index],
      ...data,
      id: this.offices[index].id, // garante imutabilidade do id
      updatedAt: new Date().toISOString(),
    };

    this.offices[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const sizeBefore = this.offices.length;
    this.offices = this.offices.filter((o) => o.id !== id);
    return this.offices.length < sizeBefore;
  }
}

// Singleton exportado: garante que os dados em memória persistam
// entre as requisições enquanto o servidor estiver rodando.
export const officeRepository: IOfficeRepository = new OfficeInMemoryRepository();
