import { User } from "./user.model";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

class UserInMemoryRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    // IDs fixos "owner-demo-XX" para casarem com o ownerId usado no
    // seed de consultórios (office.repository.ts).
    const demoUsers: User[] = [
      {
        id: "owner-demo-01",
        name: "Paula",
        email: "paula@example.com",
        passwordHash: "123456", // mock — ver aviso em user.model.ts
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        bio: "Sou arquiteta, adoro viajar, colecionar experiências e conhecer pessoas. Gosto de receber e conversar, mas também sei respeitar a privacidade de quem aluga meu espaço.",
        isSuperhost: true,
        reviewsCount: 323,
        hostRating: 4.87,
        yearsHosting: 8,
        responseRate: 100,
        responseTime: "Responde em até 1 hora",
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
        createdAt: now,
      },
    ];

    this.users.push(...demoUsers);
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
}

export const userRepository: IUserRepository = new UserInMemoryRepository();
