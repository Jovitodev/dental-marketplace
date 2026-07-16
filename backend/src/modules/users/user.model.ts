// Módulo de Usuários — cadastro único.
// Qualquer usuário autenticado pode navegar/buscar consultórios OU
// cadastrar o seu próprio (virando "anfitrião"), sem precisar de um
// tipo de conta separado. Por isso o model não tem "role" fixa.

export type UserRole = "user" | "admin";
export type UserStatus = "ATIVO" | "BANIDO";

export interface PublicHostProfile {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  isSuperhost: boolean;
  reviewsCount: number;
  hostRating: number; // nota do anfitrião (não confundir com nota do consultório)
  yearsHosting: number;
  responseRate: number; // 0-100
  responseTime: string; // ex: "Responde em até 1 hora"
  role: UserRole;
  status: UserStatus;
}

export interface User extends PublicHostProfile {
  email: string;
  // ATENÇÃO: isto é um MOCK para prototipagem. Em produção, nunca
  // armazene senha em texto puro — use bcrypt/argon2 + hashing de verdade.
  passwordHash: string;
  createdAt: string;
}

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

// O que a API devolve ao cliente após registro/login (nunca inclui a senha)
export interface AuthResponse {
  token: string;
  user: Omit<User, "passwordHash">;
}
