import { officeRepository } from "../offices/office.repository";
import { userRepository } from "../users/user.repository";

// Módulo "admin" é um agregador (BFF) que lê dados de outros módulos
// (offices, users) para montar visões gerenciais. Ele não duplica regras
// de negócio: ações de escrita (banir, aprovar, etc.) continuam vivendo
// nos services originais (userService, officeService); este módulo só
// orquestra e resume os dados para a tela /admin.

// Taxa de comissão simulada da plataforma sobre o "faturamento" estimado.
const PLATFORM_FEE_PERCENT = 12;

export const adminService = {
  async getMetrics() {
    const [offices, users] = await Promise.all([officeRepository.findAll(), userRepository.findAll()]);

    const activeOffices = offices.filter((o) => o.status === "ATIVO" && o.moderationStatus === "APROVADO");
    const pendingOffices = offices.filter((o) => o.moderationStatus === "PENDENTE");
    const rejectedOffices = offices.filter((o) => o.moderationStatus === "RECUSADO");
    const bannedUsers = users.filter((u) => u.status === "BANIDO");
    const admins = users.filter((u) => u.role === "admin");

    const totalReviews = offices.reduce((sum, o) => sum + (o.reviews?.length ?? 0), 0);
    const avgRating =
      offices.length > 0
        ? offices.reduce((sum, o) => sum + (o.rating ?? 0), 0) / offices.length
        : 0;

    return {
      totalUsers: users.length,
      totalAdmins: admins.length,
      bannedUsers: bannedUsers.length,
      totalOffices: offices.length,
      activeOffices: activeOffices.length,
      pendingOffices: pendingOffices.length,
      rejectedOffices: rejectedOffices.length,
      totalReviews,
      averageRating: Number(avgRating.toFixed(2)),
    };
  },

  // Painel de finanças 100% simulado — não há módulo de pagamentos ainda.
  // Estima receita somando o menor preço de turno de cada consultório ATIVO
  // e aprovado, multiplicado por um número fixo de reservas/mês fictício,
  // só para dar uma noção visual de escala no dashboard.
  async getFinanceSummary() {
    const offices = await officeRepository.findAll({ status: "ATIVO", moderationStatus: "APROVADO" });

    const MOCK_BOOKINGS_PER_OFFICE_PER_MONTH = 8;

    const estimatedMonthlyGrossRevenue = offices.reduce((sum, o) => {
      const cheapestShift = Math.min(...o.shiftPrices.map((sp) => sp.price));
      return sum + cheapestShift * MOCK_BOOKINGS_PER_OFFICE_PER_MONTH;
    }, 0);

    const platformFeeRevenue = estimatedMonthlyGrossRevenue * (PLATFORM_FEE_PERCENT / 100);
    const hostPayoutTotal = estimatedMonthlyGrossRevenue - platformFeeRevenue;

    // Série mensal fictícia (últimos 6 meses) só para dar uma ideia de tendência.
    const monthlyTrend = [0.62, 0.7, 0.68, 0.81, 0.9, 1].map((factor) => ({
      grossRevenue: Number((estimatedMonthlyGrossRevenue * factor).toFixed(2)),
    }));

    return {
      platformFeePercent: PLATFORM_FEE_PERCENT,
      estimatedMonthlyGrossRevenue: Number(estimatedMonthlyGrossRevenue.toFixed(2)),
      platformFeeRevenue: Number(platformFeeRevenue.toFixed(2)),
      hostPayoutTotal: Number(hostPayoutTotal.toFixed(2)),
      activeListingsConsidered: offices.length,
      monthlyTrend,
      isSimulated: true,
    };
  },
};
