import { api } from "./api";
import { Office } from "../types/office";
import { User } from "../types/user";

export interface AdminMetrics {
  totalUsers: number;
  totalAdmins: number;
  bannedUsers: number;
  totalOffices: number;
  activeOffices: number;
  pendingOffices: number;
  rejectedOffices: number;
  totalReviews: number;
  averageRating: number;
}

export interface FinanceSummary {
  platformFeePercent: number;
  estimatedMonthlyGrossRevenue: number;
  platformFeeRevenue: number;
  hostPayoutTotal: number;
  activeListingsConsidered: number;
  monthlyTrend: { grossRevenue: number }[];
  isSimulated: boolean;
}

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    const { data } = await api.get<AdminMetrics>("/admin/metrics");
    return data;
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    const { data } = await api.get<FinanceSummary>("/admin/finance");
    return data;
  },

  async listUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/admin/users");
    return data;
  },

  async toggleBanUser(id: string): Promise<User> {
    const { data } = await api.patch<User>(`/admin/users/${id}/ban`);
    return data;
  },

  async togglePromoteUser(id: string): Promise<User> {
    const { data } = await api.patch<User>(`/admin/users/${id}/promote`);
    return data;
  },

  async listPendingOffices(): Promise<Office[]> {
    const { data } = await api.get<Office[]>("/admin/offices/pending");
    return data;
  },

  async approveOffice(id: string): Promise<Office> {
    const { data } = await api.patch<Office>(`/admin/offices/${id}/approve`);
    return data;
  },

  async rejectOffice(id: string): Promise<Office> {
    const { data } = await api.patch<Office>(`/admin/offices/${id}/reject`);
    return data;
  },
};
