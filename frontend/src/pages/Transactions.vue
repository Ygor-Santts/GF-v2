<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Section -->
    <div
      class="relative p-6 rounded-2xl shadow-lg-custom overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white"
    >
      <div class="absolute inset-0 opacity-10">
        <CreditCard class="w-full h-full" />
      </div>
      <div
        class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h1 class="text-3xl font-bold mb-1">Transações</h1>
          <p class="text-blue-100 text-lg">
            Gerencie suas receitas e despesas de forma inteligente
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            v-model="selectedMonth"
            @change="loadTransactions"
            class="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/70 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-white/50 focus:border-white/50"
          >
            <option
              v-for="month in availableMonths"
              :key="month.value"
              :value="month.value"
              class="text-gray-900"
            >
              {{ month.label }}
            </option>
          </select>
          <button
            @click="showAddModal = true"
            class="btn-secondary text-white border-white/30 hover:bg-white/20"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card animate-slide-up delay-100">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-slate-500">Total de Receitas</p>
          <ArrowUpCircle class="w-5 h-5 text-emerald-500" />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ formatCurrency(totalIncome) }}
        </p>
        <div class="flex items-center text-sm text-emerald-600 mt-2">
          <TrendingUp class="w-4 h-4 mr-1" />
          <span>Entradas do período</span>
        </div>
      </div>

      <div class="card animate-slide-up delay-200">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-slate-500">Total de Gastos</p>
          <ArrowDownCircle class="w-5 h-5 text-red-500" />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ formatCurrency(Math.abs(totalExpenses)) }}
        </p>
        <div class="flex items-center text-sm text-red-600 mt-2">
          <TrendingDown class="w-4 h-4 mr-1" />
          <span>Saídas do período</span>
        </div>
      </div>

      <div class="card animate-slide-up delay-300">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-slate-500">Saldo</p>
          <Wallet class="w-5 h-5 text-blue-500" />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ formatCurrency(balance) }}
        </p>
        <div
          class="flex items-center text-sm mt-2"
          :class="balance >= 0 ? 'text-emerald-600' : 'text-red-600'"
        >
          <template v-if="balance >= 0">
            <ArrowUp class="w-4 h-4 mr-1" />
            <span>Saldo Positivo</span>
          </template>
          <template v-else>
            <ArrowDown class="w-4 h-4 mr-1" />
            <span>Saldo Negativo</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card animate-slide-up delay-400">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Tipo:</label>
          <select
            v-model="filters.type"
            @change="applyFilters"
            class="bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Gastos</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Status:</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="PLANNED">Planejado</option>
            <option value="PAID">Pago</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Categoria:</label>
          <select
            v-model="filters.category"
            @change="applyFilters"
            class="bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <div class="flex items-center space-x-2 flex-1 min-w-64">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400" />
          <input
            v-model="filters.search"
            @input="applyFilters"
            placeholder="Buscar transações..."
            class="bg-slate-50 border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1"
          />
        </div>

        <button @click="clearFilters" class="btn-secondary text-sm">
          <X class="w-4 h-4 mr-2" />
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card animate-slide-up delay-500">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-slate-900">
          Transações ({{ filteredTransactions.length }})
        </h3>
        <div class="flex items-center space-x-2">
          <button @click="exportTransactions" class="btn-secondary text-sm">
            <Download class="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                @click="sortBy('date')"
              >
                Data
                <ChevronUpDown class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                @click="sortBy('category')"
              >
                Categoria
                <ChevronUpDown class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Descrição
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                @click="sortBy('amount')"
              >
                Valor
                <ChevronUpDown class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              class="hover:bg-slate-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    transaction.type === 'INCOME'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  <ArrowUp
                    v-if="transaction.type === 'INCOME'"
                    class="w-3 h-3 mr-1"
                  />
                  <ArrowDown v-else class="w-3 h-3 mr-1" />
                  {{ transaction.type === "INCOME" ? "Receita" : "Gasto" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {{ transaction.category }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-900">
                <div class="max-w-xs truncate">
                  {{ transaction.description || "Sem descrição" }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                :class="
                  transaction.type === 'INCOME'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                "
              >
                {{ transaction.type === "INCOME" ? "+" : "-"
                }}{{
                  formatCurrency(
                    Math.abs(
                      transaction.amount || transaction.plannedAmount || 0
                    )
                  )
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    transaction.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  "
                >
                  {{ transaction.status === "PAID" ? "Pago" : "Planejado" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editTransaction(transaction)"
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteTransaction(transaction)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <button
                    v-if="transaction.status === 'PLANNED'"
                    @click="markAsPaid(transaction)"
                    class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Marcar como Pago"
                  >
                    <Check class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200"
      >
        <div class="flex items-center">
          <p class="text-sm text-gray-700">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{
              Math.min(currentPage * itemsPerPage, filteredTransactions.length)
            }}
            de {{ filteredTransactions.length }} resultados
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="btn-secondary text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-700"
            >{{ currentPage }} de {{ totalPages }}</span
          >
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="btn-secondary text-sm"
            :class="{
              'opacity-50 cursor-not-allowed': currentPage === totalPages,
            }"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <TransactionModal
      :show="showAddModal || showEditModal"
      :transaction="editingTransaction"
      :categories="categories"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import TransactionModal from "../components/TransactionModal.vue";
import {
  CreditCard,
  Plus as PlusIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUp,
  ArrowDown,
  Search as MagnifyingGlassIcon,
  X,
  Download,
  ChevronsUpDown as ChevronUpDown,
  Edit,
  Trash2,
  Check,
} from "lucide-vue-next";

// Import types from service
import type { Transaction } from "../services/transactionService";

// Store
const transactionStore = useTransactionStore();

// Reactive data
const categories = ref<string[]>([]);
const selectedMonth = ref("");
const availableMonths = ref<Array<{ value: string; label: string }>>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingTransaction = ref<Transaction | null | undefined>(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const sortField = ref("date");
const sortDirection = ref<"asc" | "desc">("desc");

// Filters
const filters = ref({
  type: "",
  status: "",
  category: "",
  search: "",
});

// Initialize months
const initializeMonths = () => {
  const months: Array<{ value: string; label: string }> = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    months.push({
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
  }

  availableMonths.value = months;
  selectedMonth.value = months[0].value;
};

// Computed properties
const filteredTransactions = computed(() => {
  let filtered = [...transactionStore.transactions];

  // Apply filters
  if (filters.value.type) {
    filtered = filtered.filter((t) => t.type === filters.value.type);
  }

  if (filters.value.status) {
    filtered = filtered.filter((t) => t.status === filters.value.status);
  }

  if (filters.value.category) {
    filtered = filtered.filter((t) => t.category === filters.value.category);
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        (t.description || "").toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortField.value as keyof Transaction];
    let bValue: any = b[sortField.value as keyof Transaction];

    if (sortField.value === "amount") {
      aValue = a.amount || a.plannedAmount || 0;
      bValue = b.amount || b.plannedAmount || 0;
    }

    if (sortField.value === "date") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection.value === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const totalIncome = computed(() => transactionStore.totalIncome);

const totalExpenses = computed(() => transactionStore.totalExpenses);

const balance = computed(() => transactionStore.balance);

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const getYear = () => Number(selectedMonth.value.split("-")[0]);
const getMonth = () => Number(selectedMonth.value.split("-")[1]);

// Data loading
const loadTransactions = async () => {
  try {
    const startDate = new Date(getYear(), getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(getYear(), getMonth(), 0)
      .toISOString()
      .split("T")[0];

    await transactionStore.fetchTransactions({
      startDate,
      endDate,
    });

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(transactionStore.transactions.map((t) => t.category)),
    ];
    categories.value = uniqueCategories.sort();
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
};

// Actions
const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  filters.value = {
    type: "",
    status: "",
    category: "",
    search: "",
  };
  currentPage.value = 1;
};

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = { ...transaction };
  showEditModal.value = true;
};

const deleteTransaction = async (transaction: Transaction) => {
  if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

  try {
    await transactionStore.deleteTransaction(transaction._id!);
    await loadTransactions();
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
};

const markAsPaid = async (transaction: Transaction) => {
  try {
    await transactionStore.markAsPaid(
      transaction._id!,
      transaction.amount || transaction.plannedAmount
    );
    await loadTransactions();
  } catch (error) {
    console.error("Error marking transaction as paid:", error);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingTransaction.value = null;
};

const handleSave = async () => {
  await loadTransactions();
  closeModal();
};

const exportTransactions = () => {
  // Implementation for exporting transactions
  console.log("Exporting transactions...");
};

// Watchers
watch(filteredTransactions, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value);
  }
});

// Lifecycle
onMounted(() => {
  initializeMonths();
  loadTransactions();
});
</script>
