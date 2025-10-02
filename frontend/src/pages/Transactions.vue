<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transações</h1>
        <p class="mt-1 text-sm text-gray-500">
          Gerencie suas receitas e despesas
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <select
          v-model="selectedMonth"
          @change="loadTransactions"
          class="select"
        >
          <option
            v-for="month in availableMonths"
            :key="month.value"
            :value="month.value"
          >
            {{ month.label }}
          </option>
        </select>
        <button @click="showAddModal = true" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Nova Transação
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <ArrowUpIcon class="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total de Receitas</p>
            <p class="text-2xl font-semibold text-success-600">
              {{ formatCurrency(totalIncome) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center"
            >
              <ArrowDownIcon class="w-5 h-5 text-danger-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total de Gastos</p>
            <p class="text-2xl font-semibold text-danger-600">
              {{ formatCurrency(Math.abs(totalExpenses)) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <ScaleIcon class="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Saldo</p>
            <p
              class="text-2xl font-semibold"
              :class="balance >= 0 ? 'text-success-600' : 'text-danger-600'"
            >
              {{ formatCurrency(balance) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Tipo:</label>
          <select
            v-model="filters.type"
            @change="applyFilters"
            class="select text-sm"
          >
            <option value="">Todos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Gastos</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="select text-sm"
          >
            <option value="">Todos</option>
            <option value="PLANNED">Planejado</option>
            <option value="PAID">Pago</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Categoria:</label>
          <select
            v-model="filters.category"
            @change="applyFilters"
            class="select text-sm"
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

        <div class="flex items-center space-x-2">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
          <input
            v-model="filters.search"
            @input="applyFilters"
            placeholder="Buscar transações..."
            class="input text-sm"
          />
        </div>

        <button @click="clearFilters" class="btn-secondary text-sm">
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Transações ({{ filteredTransactions.length }})
        </h3>
        <div class="flex items-center space-x-2">
          <button @click="exportTransactions" class="btn-secondary text-sm">
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('date')"
              >
                Data
                <ChevronUpDownIcon class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('category')"
              >
                Categoria
                <ChevronUpDownIcon class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descrição
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortBy('amount')"
              >
                Valor
                <ChevronUpDownIcon class="w-4 h-4 inline ml-1" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              class="hover:bg-gray-50 transition-colors duration-150"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="badge"
                  :class="
                    transaction.type === 'INCOME'
                      ? 'badge-success'
                      : 'badge-danger'
                  "
                >
                  <ArrowUpIcon
                    v-if="transaction.type === 'INCOME'"
                    class="w-3 h-3 mr-1"
                  />
                  <ArrowDownIcon v-else class="w-3 h-3 mr-1" />
                  {{ transaction.type === "INCOME" ? "Receita" : "Gasto" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transaction.category }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="max-w-xs truncate">
                  {{ transaction.description || "Sem descrição" }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                :class="
                  transaction.type === 'INCOME'
                    ? 'text-success-600'
                    : 'text-danger-600'
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
                  class="badge"
                  :class="
                    transaction.status === 'PAID'
                      ? 'badge-success'
                      : 'badge-warning'
                  "
                >
                  {{ transaction.status === "PAID" ? "Pago" : "Planejado" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editTransaction(transaction)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteTransaction(transaction)"
                    class="text-danger-600 hover:text-danger-900"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="transaction.status === 'PLANNED'"
                    @click="markAsPaid(transaction)"
                    class="text-success-600 hover:text-success-900"
                  >
                    <CheckIcon class="w-4 h-4" />
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
import api from "../api/http";

// Types
interface Transaction {
  _id?: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  plannedAmount?: number;
  amount?: number;
  account?: string;
  isFixed?: boolean;
  status?: "PLANNED" | "PAID";
}

// Reactive data
const transactions = ref<Transaction[]>([]);
const categories = ref<string[]>([]);
const selectedMonth = ref("");
const availableMonths = ref<Array<{ value: string; label: string }>>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingTransaction = ref<Transaction | null>(null);
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
  const months = [];
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
  let filtered = [...transactions.value];

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

const totalIncome = computed(() => {
  return transactions.value
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0);
});

const totalExpenses = computed(() => {
  return transactions.value
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0);
});

const balance = computed(() => totalIncome.value + totalExpenses.value);

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
    const response = await api.get("/api/transactions", {
      params: { year: getYear(), month: getMonth() },
    });
    transactions.value = response.data;

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(transactions.value.map((t) => t.category)),
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
    await api.delete(`/api/transactions/${transaction._id}`);
    await loadTransactions();
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
};

const markAsPaid = async (transaction: Transaction) => {
  try {
    await api.put(`/api/transactions/${transaction._id}`, {
      ...transaction,
      status: "PAID",
      amount: transaction.amount || transaction.plannedAmount,
    });
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
