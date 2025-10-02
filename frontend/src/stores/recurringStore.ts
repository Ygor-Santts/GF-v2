import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  recurringService,
  type RecurringTransaction,
} from "../services/recurringService";

export const useRecurringStore = defineStore("recurring", () => {
  // State
  const recurringTransactions = ref<RecurringTransaction[]>([]);
  const currentRecurring = ref<RecurringTransaction | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeRecurring = computed(() =>
    recurringTransactions.value.filter((r) => r.isActive)
  );

  const inactiveRecurring = computed(() =>
    recurringTransactions.value.filter((r) => !r.isActive)
  );

  const incomeRecurring = computed(() =>
    activeRecurring.value.filter((r) => r.type === "INCOME")
  );

  const expenseRecurring = computed(() =>
    activeRecurring.value.filter((r) => r.type === "EXPENSE")
  );

  const totalMonthlyIncome = computed(() =>
    incomeRecurring.value.reduce((sum, r) => sum + r.amount, 0)
  );

  const totalMonthlyExpenses = computed(() =>
    expenseRecurring.value.reduce((sum, r) => sum + r.amount, 0)
  );

  const monthlyBalance = computed(
    () => totalMonthlyIncome.value - totalMonthlyExpenses.value
  );

  const recurringByCategory = computed(() => {
    const categories: Record<
      string,
      { income: number; expense: number; count: number }
    > = {};

    activeRecurring.value.forEach((r) => {
      if (!categories[r.category]) {
        categories[r.category] = { income: 0, expense: 0, count: 0 };
      }

      if (r.type === "INCOME") {
        categories[r.category].income += r.amount;
      } else {
        categories[r.category].expense += r.amount;
      }
      categories[r.category].count++;
    });

    return categories;
  });

  // Actions
  const fetchRecurringTransactions = async () => {
    try {
      loading.value = true;
      error.value = null;

      recurringTransactions.value =
        await recurringService.getRecurringTransactions();
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar transações recorrentes";
      console.error("Erro ao buscar transações recorrentes:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchRecurringById = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      currentRecurring.value = await recurringService.getRecurringById(id);
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar transação recorrente";
      console.error("Erro ao buscar transação recorrente:", err);
    } finally {
      loading.value = false;
    }
  };

  const createRecurring = async (
    recurring: Omit<RecurringTransaction, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const newRecurring = await recurringService.createRecurring(recurring);
      recurringTransactions.value.unshift(newRecurring);

      return newRecurring;
    } catch (err: any) {
      error.value = err.message || "Erro ao criar transação recorrente";
      console.error("Erro ao criar transação recorrente:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRecurring = async (
    id: string,
    recurring: Partial<RecurringTransaction>
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedRecurring = await recurringService.updateRecurring(
        id,
        recurring
      );

      const index = recurringTransactions.value.findIndex((r) => r._id === id);
      if (index !== -1) {
        recurringTransactions.value[index] = updatedRecurring;
      }

      return updatedRecurring;
    } catch (err: any) {
      error.value = err.message || "Erro ao atualizar transação recorrente";
      console.error("Erro ao atualizar transação recorrente:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      await recurringService.deleteRecurring(id);

      const index = recurringTransactions.value.findIndex((r) => r._id === id);
      if (index !== -1) {
        recurringTransactions.value.splice(index, 1);
      }
    } catch (err: any) {
      error.value = err.message || "Erro ao deletar transação recorrente";
      console.error("Erro ao deletar transação recorrente:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedRecurring = await recurringService.toggleActive(
        id,
        isActive
      );

      const index = recurringTransactions.value.findIndex((r) => r._id === id);
      if (index !== -1) {
        recurringTransactions.value[index] = updatedRecurring;
      }

      return updatedRecurring;
    } catch (err: any) {
      error.value = err.message || "Erro ao alterar status";
      console.error("Erro ao alterar status:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const processRecurring = async () => {
    try {
      loading.value = true;
      error.value = null;

      const result = await recurringService.processRecurring();

      // Refresh the list after processing
      await fetchRecurringTransactions();

      return result;
    } catch (err: any) {
      error.value = err.message || "Erro ao processar transações recorrentes";
      console.error("Erro ao processar transações recorrentes:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetStore = () => {
    recurringTransactions.value = [];
    currentRecurring.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    recurringTransactions,
    currentRecurring,
    loading,
    error,

    // Getters
    activeRecurring,
    inactiveRecurring,
    incomeRecurring,
    expenseRecurring,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    monthlyBalance,
    recurringByCategory,

    // Actions
    fetchRecurringTransactions,
    fetchRecurringById,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processRecurring,
    clearError,
    resetStore,
  };
});
