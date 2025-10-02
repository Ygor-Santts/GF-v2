import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  transactionService,
  type Transaction,
  type TransactionFilters,
  type TransactionResponse,
} from "../services/transactionService";

export const useTransactionStore = defineStore("transaction", () => {
  // State
  const transactions = ref<Transaction[]>([]);
  const currentTransaction = ref<Transaction | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  // Getters
  const incomeTransactions = computed(() =>
    transactions.value.filter((t) => t.type === "INCOME")
  );

  const expenseTransactions = computed(() =>
    transactions.value.filter((t) => t.type === "EXPENSE")
  );

  const totalIncome = computed(() =>
    incomeTransactions.value.reduce(
      (sum, t) => sum + (t.amount || t.plannedAmount || 0),
      0
    )
  );

  const totalExpenses = computed(() =>
    expenseTransactions.value.reduce(
      (sum, t) => sum + (t.amount || t.plannedAmount || 0),
      0
    )
  );

  const balance = computed(() => totalIncome.value - totalExpenses.value);

  const recentTransactions = computed(() =>
    transactions.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  );

  // Actions
  const fetchTransactions = async (filters?: TransactionFilters) => {
    try {
      loading.value = true;
      error.value = null;

      const response: TransactionResponse =
        await transactionService.getTransactions(filters);

      transactions.value = response.transactions;
      pagination.value = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
        limit: filters?.limit || 10,
      };
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar transações";
      console.error("Erro ao buscar transações:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchTransactionById = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      currentTransaction.value = await transactionService.getTransactionById(
        id
      );
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar transação";
      console.error("Erro ao buscar transação:", err);
    } finally {
      loading.value = false;
    }
  };

  const createTransaction = async (
    transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const newTransaction = await transactionService.createTransaction(
        transaction
      );
      transactions.value.unshift(newTransaction);

      return newTransaction;
    } catch (err: any) {
      error.value = err.message || "Erro ao criar transação";
      console.error("Erro ao criar transação:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedTransaction = await transactionService.updateTransaction(
        id,
        transaction
      );

      const index = transactions.value.findIndex((t) => t._id === id);
      if (index !== -1) {
        transactions.value[index] = updatedTransaction;
      }

      return updatedTransaction;
    } catch (err: any) {
      error.value = err.message || "Erro ao atualizar transação";
      console.error("Erro ao atualizar transação:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      await transactionService.deleteTransaction(id);

      const index = transactions.value.findIndex((t) => t._id === id);
      if (index !== -1) {
        transactions.value.splice(index, 1);
      }
    } catch (err: any) {
      error.value = err.message || "Erro ao deletar transação";
      console.error("Erro ao deletar transação:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const markAsPaid = async (id: string, amount?: number) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedTransaction = await transactionService.markAsPaid(
        id,
        amount
      );

      const index = transactions.value.findIndex((t) => t._id === id);
      if (index !== -1) {
        transactions.value[index] = updatedTransaction;
      }

      return updatedTransaction;
    } catch (err: any) {
      error.value = err.message || "Erro ao marcar como pago";
      console.error("Erro ao marcar como pago:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelTransaction = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedTransaction = await transactionService.cancelTransaction(id);

      const index = transactions.value.findIndex((t) => t._id === id);
      if (index !== -1) {
        transactions.value[index] = updatedTransaction;
      }

      return updatedTransaction;
    } catch (err: any) {
      error.value = err.message || "Erro ao cancelar transação";
      console.error("Erro ao cancelar transação:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetStore = () => {
    transactions.value = [];
    currentTransaction.value = null;
    loading.value = false;
    error.value = null;
    pagination.value = {
      page: 1,
      totalPages: 1,
      total: 0,
      limit: 10,
    };
  };

  return {
    // State
    transactions,
    currentTransaction,
    loading,
    error,
    pagination,

    // Getters
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    balance,
    recentTransactions,

    // Actions
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    cancelTransaction,
    clearError,
    resetStore,
  };
});
