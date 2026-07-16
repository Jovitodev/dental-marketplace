// Espelha backend/src/modules/users/user.model.ts

export type UserRole = "user" | "admin";
export type UserStatus = "ATIVO" | "BANIDO";

export interface PublicHostProfile {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  isSuperhost: boolean;
  reviewsCount: number;
  hostRating: number;
  yearsHosting: number;
  responseRate: number;
  responseTime: string;
  role: UserRole;
  status: UserStatus;
}

export interface User extends PublicHostProfile {
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
