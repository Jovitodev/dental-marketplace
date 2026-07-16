import { User } from "./user.model";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, patch: Partial<User>): Promise<User | null>;
}

class UserInMemoryRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    // IDs fixos "owner-demo-XX" para casarem com o ownerId usado no
    // seed de consultórios (office.repository.ts). O usuário "admin-demo-01"
    // é o único com role "admin" e serve para testar o painel /admin.
    const demoUsers: User[] = [
      {
        id: "admin-demo-01",
        name: "Admin DentSpot",
        email: "admin@dentspot.com",
        passwordHash: "admin123", // mock — ver aviso em user.model.ts
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
        bio: "Conta de administração da plataforma.",
        isSuperhost: false,
        reviewsCount: 0,
        hostRating: 0,
        yearsHosting: 0,
        responseRate: 100,
        responseTime: "—",
        role: "admin",
        status: "ATIVO",
        createdAt: now,
      },
      {
        id: "owner-demo-01",
        name: "Paula",
        email: "paula@example.com",
        passwordHash: "123456",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        bio: "Sou arquiteta, adoro viajar, colecionar experiências e conhecer pessoas. Gosto de receber e conversar, mas também sei respeitar a privacidade de quem aluga meu espaço.",
        isSuperhost: true,
        reviewsCount: 323,
        hostRating: 4.87,
        yearsHosting: 8,
        responseRate: 100,
        responseTime: "Responde em até 1 hora",
        role: "user",
        status: "ATIVO",
        createdAt: now,
      },
      {
        id: "owner-demo-02",
        name: "Marcelo Dentista",
        email: "marcelo@example.com",
        passwordHash: "123456",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
        bio: "Cirurgião-dentista há 12 anos, hoje também administro consultórios para colegas de profissão na região da Aldeota.",
        isSuperhost: false,
        reviewsCount: 58,
        hostRating: 4.7,
        yearsHosting: 3,
        responseRate: 95,
        responseTime: "Responde em algumas horas",
        role: "user",
        status: "ATIVO",
        createdAt: now,
      },
      {
        id: "owner-demo-03",
        name: "Camila Souza",
        email: "camila@example.com",
        passwordHash: "123456",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
        bio: "Tenho um espaço tranquilo na Serrinha, ótimo para quem busca privacidade e atendimento particular.",
        isSuperhost: false,
        reviewsCount: 21,
        hostRating: 4.96,
        yearsHosting: 2,
        responseRate: 90,
        responseTime: "Responde em até 1 dia",
        role: "user",
        status: "ATIVO",
        createdAt: now,
      },
    ];

    this.users.push(...demoUsers);
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return [...this.users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...patch, id: this.users[index].id };
    return this.users[index];
  }
}

export const userRepository: IUserRepository = new UserInMemoryRepository();
