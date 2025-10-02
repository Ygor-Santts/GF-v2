import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  reportsService,
  type DashboardData,
  type ReportFilters,
} from "../services/reportsService";

export const useDashboardStore = defineStore("dashboard", () => {
  // State
  const dashboardData = ref<DashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Getters
  const summary = computed(
    () =>
      dashboardData.value?.summary || {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        incomeGrowth: 0,
        expenseGrowth: 0,
        savingsRate: 0,
        monthlyAverage: 0,
      }
  );

  const monthlyData = computed(() => dashboardData.value?.monthlyData || []);

  const categoryData = computed(() => dashboardData.value?.categoryData || []);

  const recentTransactions = computed(
    () => dashboardData.value?.recentTransactions || []
  );

  const incomeCategories = computed(() =>
    categoryData.value.filter((cat) => cat.type === "INCOME")
  );

  const expenseCategories = computed(() =>
    categoryData.value.filter((cat) => cat.type === "EXPENSE")
  );

  const isPositiveBalance = computed(() => summary.value.netBalance > 0);

  const savingsPercentage = computed(() => {
    if (summary.value.totalIncome === 0) return 0;
    return (summary.value.netBalance / summary.value.totalIncome) * 100;
  });

  // Métricas de contagem
  const totalTransactions = computed(() => recentTransactions.value.length);

  const incomeTransactions = computed(
    () => recentTransactions.value.filter((t) => t.type === "INCOME").length
  );

  const expenseTransactions = computed(
    () => recentTransactions.value.filter((t) => t.type === "EXPENSE").length
  );

  const paidTransactions = computed(
    () => recentTransactions.value.filter((t) => t.status === "PAID").length
  );

  const plannedTransactions = computed(
    () => recentTransactions.value.filter((t) => t.status === "PLANNED").length
  );

  const monthlyTrend = computed(() => {
    if (monthlyData.value.length < 2) return "stable";

    const current = monthlyData.value[monthlyData.value.length - 1];
    const previous = monthlyData.value[monthlyData.value.length - 2];

    if (current.balance > previous.balance) return "up";
    if (current.balance < previous.balance) return "down";
    return "stable";
  });

  // Actions
  const fetchDashboardData = async (filters?: ReportFilters) => {
    try {
      loading.value = true;
      error.value = null;

      const data = await reportsService.getDashboardData(filters);
      dashboardData.value = data;
      lastUpdated.value = new Date();
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar dados do dashboard";
      console.error("Erro ao buscar dados do dashboard:", err);
    } finally {
      loading.value = false;
    }
  };

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  const clearError = () => {
    error.value = null;
  };

  const resetStore = () => {
    dashboardData.value = null;
    loading.value = false;
    error.value = null;
    lastUpdated.value = null;
  };

  // Utility methods
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getMonthName = (monthString: string): string => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  return {
    // State
    dashboardData,
    loading,
    error,
    lastUpdated,

    // Getters
    summary,
    monthlyData,
    categoryData,
    recentTransactions,
    incomeCategories,
    expenseCategories,
    isPositiveBalance,
    savingsPercentage,
    monthlyTrend,

    // Métricas de contagem
    totalTransactions,
    incomeTransactions,
    expenseTransactions,
    paidTransactions,
    plannedTransactions,

    // Actions
    fetchDashboardData,
    refreshDashboard,
    clearError,
    resetStore,

    // Utilities
    formatCurrency,
    formatPercentage,
    getMonthName,
  };
});
