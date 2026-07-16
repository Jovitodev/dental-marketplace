import axios from "axios";
import { CreateOfficeDTO, Office, UpdateOfficeDTO } from "../types/office";
import { tokenStorage } from "./tokenStorage";

// Ponto único de configuração da API.
// Ao criar novos módulos (chat, avaliações, pagamentos), crie novos
// arquivos de serviço (ex: chat.service.ts) reaproveitando esta instância "api".

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Anexa o token salvo (se existir) em toda requisição — necessário para
// as rotas protegidas do módulo admin.
api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const officeService = {
  async list(params?: { ownerId?: string; status?: string; moderationStatus?: string }): Promise<Office[]> {
    const { data } = await api.get<Office[]>("/offices", { params });
    return data;
  },

  async getById(id: string): Promise<Office> {
    const { data } = await api.get<Office>(`/offices/${id}`);
    return data;
  },

  async create(payload: CreateOfficeDTO): Promise<Office> {
    const { data } = await api.post<Office>("/offices", payload);
    return data;
  },

  async update(id: string, payload: UpdateOfficeDTO): Promise<Office> {
    const { data } = await api.put<Office>(`/offices/${id}`, payload);
    return data;
  },

  async toggleStatus(id: string): Promise<Office> {
    const { data } = await api.patch<Office>(`/offices/${id}/toggle-status`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/offices/${id}`);
  },
};
