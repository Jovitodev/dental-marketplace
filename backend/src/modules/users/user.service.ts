import { randomUUID } from "crypto";
import {
  AuthResponse,
  LoginUserDTO,
  PublicHostProfile,
  RegisterUserDTO,
  User,
} from "./user.model";
import { userRepository } from "./user.repository";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function toPublicUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// Mock de token: NÃO usar em produção. Trocar por JWT assinado.
function generateMockToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

export const userService = {
  async register(data: RegisterUserDTO): Promise<AuthResponse> {
    if (!data.name?.trim()) throw new AuthError("Nome é obrigatório.");
    if (!data.email?.trim()) throw new AuthError("E-mail é obrigatório.");
    if (!data.password || data.password.length < 6) {
      throw new AuthError("A senha deve ter ao menos 6 caracteres.");
    }

    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AuthError("Já existe uma conta com este e-mail.");

    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.password, // mock — ver aviso em user.model.ts
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      bio: "",
      isSuperhost: false,
      reviewsCount: 0,
      hostRating: 0,
      yearsHosting: 0,
      responseRate: 100,
      responseTime: "Novo por aqui",
      createdAt: now,
    };

    await userRepository.create(user);

    return { token: generateMockToken(user.id), user: toPublicUser(user) };
  },

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(data.email);
    if (!user || user.passwordHash !== data.password) {
      throw new AuthError("E-mail ou senha inválidos.");
    }
    return { token: generateMockToken(user.id), user: toPublicUser(user) };
  },

  async getPublicProfile(id: string): Promise<PublicHostProfile> {
    const user = await userRepository.findById(id);
    if (!user) throw new AuthError("Usuário não encontrado.");
    const { email, passwordHash, ...publicProfile } = user;
    return publicProfile;
  },
};
