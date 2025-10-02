import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  financingService,
  type Financing,
  type FinancingPayment,
  type EarlyPaymentSimulation,
} from "../services/financingService";

export const useFinancingStore = defineStore("financing", () => {
  // State
  const financings = ref<Financing[]>([]);
  const currentFinancing = ref<Financing | null>(null);
  const financingPayments = ref<FinancingPayment[]>([]);
  const earlyPaymentSimulation = ref<EarlyPaymentSimulation | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeFinancings = computed(() =>
    financings.value.filter((f) => f.isActive)
  );

  const completedFinancings = computed(() =>
    financings.value.filter((f) => !f.isActive)
  );

  const totalOutstandingBalance = computed(() =>
    activeFinancings.value.reduce((sum, f) => sum + f.outstandingBalance, 0)
  );

  const totalMonthlyPayments = computed(() =>
    activeFinancings.value.reduce((sum, f) => sum + f.installmentAmount, 0)
  );

  const totalOriginalAmount = computed(() =>
    financings.value.reduce((sum, f) => sum + f.originalAmount, 0)
  );

  const totalPaidAmount = computed(() =>
    financings.value.reduce(
      (sum, f) => sum + (f.originalAmount - f.outstandingBalance),
      0
    )
  );

  const averageInterestRate = computed(() => {
    if (activeFinancings.value.length === 0) return 0;

    const totalRate = activeFinancings.value.reduce(
      (sum, f) => sum + f.interestRate,
      0
    );
    return totalRate / activeFinancings.value.length;
  });

  const financingsByType = computed(() => {
    const types: Record<string, Financing[]> = {};

    financings.value.forEach((f) => {
      if (!types[f.type]) {
        types[f.type] = [];
      }
      types[f.type].push(f);
    });

    return types;
  });

  const upcomingPayments = computed(() => {
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    return financingPayments.value
      .filter((p) => {
        const dueDate = new Date(p.dueDate);
        return p.status === "PENDING" && dueDate <= nextMonth;
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
  });

  const overduePayments = computed(() => {
    const today = new Date();

    return financingPayments.value.filter((p) => {
      const dueDate = new Date(p.dueDate);
      return p.status === "PENDING" && dueDate < today;
    });
  });

  // Actions
  const fetchFinancings = async () => {
    try {
      loading.value = true;
      error.value = null;

      financings.value = await financingService.getFinancings();
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar financiamentos";
      console.error("Erro ao buscar financiamentos:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchFinancingById = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      currentFinancing.value = await financingService.getFinancingById(id);
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar financiamento";
      console.error("Erro ao buscar financiamento:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchFinancingPayments = async (financingId: string) => {
    try {
      loading.value = true;
      error.value = null;

      financingPayments.value = await financingService.getFinancingPayments(
        financingId
      );
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar parcelas";
      console.error("Erro ao buscar parcelas:", err);
    } finally {
      loading.value = false;
    }
  };

  const createFinancing = async (
    financing: Omit<Financing, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const newFinancing = await financingService.createFinancing(financing);
      financings.value.unshift(newFinancing);

      return newFinancing;
    } catch (err: any) {
      error.value = err.message || "Erro ao criar financiamento";
      console.error("Erro ao criar financiamento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateFinancing = async (id: string, financing: Partial<Financing>) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedFinancing = await financingService.updateFinancing(
        id,
        financing
      );

      const index = financings.value.findIndex((f) => f._id === id);
      if (index !== -1) {
        financings.value[index] = updatedFinancing;
      }

      return updatedFinancing;
    } catch (err: any) {
      error.value = err.message || "Erro ao atualizar financiamento";
      console.error("Erro ao atualizar financiamento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteFinancing = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      await financingService.deleteFinancing(id);

      const index = financings.value.findIndex((f) => f._id === id);
      if (index !== -1) {
        financings.value.splice(index, 1);
      }
    } catch (err: any) {
      error.value = err.message || "Erro ao deletar financiamento";
      console.error("Erro ao deletar financiamento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const payInstallment = async (
    financingId: string,
    installmentNumber: number,
    amount?: number
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const payment = await financingService.payInstallment(
        financingId,
        installmentNumber,
        amount
      );

      // Update the payment in the list
      const index = financingPayments.value.findIndex(
        (p) =>
          p.financingId === financingId &&
          p.installmentNumber === installmentNumber
      );
      if (index !== -1) {
        financingPayments.value[index] = payment;
      }

      // Refresh financing data
      await fetchFinancingById(financingId);

      return payment;
    } catch (err: any) {
      error.value = err.message || "Erro ao pagar parcela";
      console.error("Erro ao pagar parcela:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const simulateEarlyPayment = async (financingId: string, amount: number) => {
    try {
      loading.value = true;
      error.value = null;

      earlyPaymentSimulation.value =
        await financingService.simulateEarlyPayment(financingId, amount);

      return earlyPaymentSimulation.value;
    } catch (err: any) {
      error.value = err.message || "Erro ao simular pagamento antecipado";
      console.error("Erro ao simular pagamento antecipado:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const makeEarlyPayment = async (financingId: string, amount: number) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedFinancing = await financingService.makeEarlyPayment(
        financingId,
        amount
      );

      const index = financings.value.findIndex((f) => f._id === financingId);
      if (index !== -1) {
        financings.value[index] = updatedFinancing;
      }

      // Clear simulation
      earlyPaymentSimulation.value = null;

      return updatedFinancing;
    } catch (err: any) {
      error.value = err.message || "Erro ao realizar pagamento antecipado";
      console.error("Erro ao realizar pagamento antecipado:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearSimulation = () => {
    earlyPaymentSimulation.value = null;
  };

  const resetStore = () => {
    financings.value = [];
    currentFinancing.value = null;
    financingPayments.value = [];
    earlyPaymentSimulation.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    financings,
    currentFinancing,
    financingPayments,
    earlyPaymentSimulation,
    loading,
    error,

    // Getters
    activeFinancings,
    completedFinancings,
    totalOutstandingBalance,
    totalMonthlyPayments,
    totalOriginalAmount,
    totalPaidAmount,
    averageInterestRate,
    financingsByType,
    upcomingPayments,
    overduePayments,

    // Actions
    fetchFinancings,
    fetchFinancingById,
    fetchFinancingPayments,
    createFinancing,
    updateFinancing,
    deleteFinancing,
    payInstallment,
    simulateEarlyPayment,
    makeEarlyPayment,
    clearError,
    clearSimulation,
    resetStore,
  };
});
