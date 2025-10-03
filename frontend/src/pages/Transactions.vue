<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Section -->
    <PageHeader
      title="Transações"
      subtitle="Gerencie suas receitas e despesas de forma inteligente"
      :background-icon="CreditCard"
    >
      <template #actions>
        <div class="flex items-center space-x-4">
          <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <PeriodSelector
              v-model="selectedPeriod"
              @change="handlePeriodChange"
              class="text-white"
            />
          </div>
          <Button
            size="lg"
            variant="secondary"
            @click="handleOpenAddModal"
            :icon="PlusIcon"
            class="text-black border-black/30 hover:bg-black/20"
          >
            Nova Transação
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        label="Total de Receitas"
        :value="totalIncome"
        :icon="ArrowUpCircle"
        icon-color="emerald"
        :format="'currency'"
        :trend="'up'"
        trend-text="Entradas do período"
        :trend-icon="TrendingUp"
        :animate="true"
        :delay="1"
      />

      <MetricCard
        label="Total de Gastos"
        :value="Math.abs(totalExpenses)"
        :icon="ArrowDownCircle"
        icon-color="red"
        :format="'currency'"
        :trend="'down'"
        trend-text="Saídas do período"
        :trend-icon="TrendingDown"
        :animate="true"
        :delay="2"
      />

      <MetricCard
        label="Saldo"
        :value="balance"
        :icon="Wallet"
        icon-color="blue"
        :format="'currency'"
        :value-color="balance >= 0 ? 'success' : 'danger'"
        :trend="balance >= 0 ? 'up' : 'down'"
        :trend-text="balance >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'"
        :trend-icon="balance >= 0 ? ArrowUp : ArrowDown"
        :animate="true"
        :delay="3"
      />
    </div>

    <!-- Filters -->
    <Card :animate="true" :delay="4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Tipo:</label>
          <Select
            v-model="filters.type"
            @change="applyFilters"
            :options="[
              { value: '', label: 'Todos' },
              { value: 'INCOME', label: 'Receitas' },
              { value: 'EXPENSE', label: 'Gastos' },
            ]"
            size="sm"
          />
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Status:</label>
          <Select
            v-model="filters.status"
            @change="applyFilters"
            :options="[
              { value: '', label: 'Todos' },
              { value: 'PLANNED', label: 'Planejado' },
              { value: 'PAID', label: 'Pago' },
            ]"
            size="sm"
          />
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-slate-700">Categoria:</label>
          <Select
            v-model="filters.category"
            @change="applyFilters"
            :options="[
              { value: '', label: 'Todas' },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]"
            size="sm"
          />
        </div>

        <div class="flex items-center space-x-2 flex-1 min-w-64">
          <Input
            v-model="filters.search"
            @input="applyFilters"
            placeholder="Buscar transações..."
            :icon="MagnifyingGlassIcon"
            size="sm"
            class="flex-1"
          />
        </div>

        <Button variant="secondary" size="sm" @click="clearFilters" :icon="X">
          Limpar Filtros
        </Button>
      </div>
    </Card>

    <!-- Transactions Table -->
    <Card :animate="true" :delay="5">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-slate-900">
            Transações ({{ filteredTransactions.length }})
          </h3>
          <div class="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              @click="exportTransactions"
              :icon="Download"
            >
              Exportar
            </Button>
          </div>
        </div>
      </template>

      <div
        class="overflow-x-auto max-h-96 overflow-y-auto"
        ref="scrollContainer"
      >
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
              v-for="transaction in displayedTransactions"
              :key="transaction._id"
              class="hover:bg-slate-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge
                  size="md"
                  :variant="
                    transaction.type === 'INCOME' ? 'success' : 'danger'
                  "
                  :icon="transaction.type === 'INCOME' ? ArrowUp : ArrowDown"
                >
                  {{ transaction.type === "INCOME" ? "Receita" : "Gasto" }}
                </Badge>
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
                <Badge
                  size="md"
                  :variant="
                    transaction.status === 'PAID' ? 'success' : 'warning'
                  "
                >
                  {{ transaction.status === "PAID" ? "Pago" : "Planejado" }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editTransaction(transaction)"
                    :icon="Edit"
                    title="Editar"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="deleteTransaction(transaction)"
                    :icon="Trash2"
                    title="Excluir"
                    class="hover:text-red-600 hover:bg-red-50"
                  />
                  <Button
                    v-if="transaction.status === 'PLANNED'"
                    variant="ghost"
                    size="sm"
                    @click="markAsPaid(transaction)"
                    :icon="Check"
                    title="Marcar como Pago"
                    class="hover:text-emerald-600 hover:bg-emerald-50"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <!-- Pagination -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <!-- Transaction counter -->
            <div class="flex items-center">
              <p class="text-sm text-gray-700">
                Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
                {{
                  Math.min(
                    currentPage * itemsPerPage,
                    filteredTransactions.length
                  )
                }}
                de {{ filteredTransactions.length }} resultados
              </p>
            </div>

            <!-- Pagination controls -->
            <div v-if="totalPages > 1" class="flex items-center space-x-2">
              <!-- Previous button -->
              <button
                @click="goToPreviousPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <!-- Page numbers -->
              <div class="flex items-center space-x-1">
                <!-- First page -->
                <button
                  v-if="currentPage > 3"
                  @click="goToPage(1)"
                  class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>

                <!-- Ellipsis for large gaps -->
                <span v-if="currentPage > 4" class="px-2 text-gray-500"
                  >...</span
                >

                <!-- Pages around current page -->
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="{
                    'bg-blue-600 text-white border border-blue-600':
                      page === currentPage,
                    'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50':
                      page !== currentPage,
                  }"
                >
                  {{ page }}
                </button>

                <!-- Ellipsis for large gaps -->
                <span
                  v-if="currentPage < totalPages - 3"
                  class="px-2 text-gray-500"
                  >...</span
                >

                <!-- Last page -->
                <button
                  v-if="currentPage < totalPages - 2"
                  @click="goToPage(totalPages)"
                  class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {{ totalPages }}
                </button>
              </div>

              <!-- Next button -->
              <button
                @click="goToNextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Add/Edit Transaction Modal -->
    <TransactionModal
      :show="shouldShowModal"
      :transaction="modalType === 'edit-transaction' ? modalData : null"
      :categories="categories"
      @close="handleCloseModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import { useModal } from "../composables/useModal";
import TransactionModal from "../components/TransactionModal.vue";
import {
  Button,
  Card,
  Badge,
  PageHeader,
  Input,
  Select,
  PeriodSelector,
} from "../components/ui";
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
import MetricCard from "../components/ui/MetricCard.vue";

// Store
const transactionStore = useTransactionStore();
const { openModal, closeModal, isModalOpen, modalType, modalData } = useModal();

// Computed for modal visibility
const shouldShowModal = computed(() => {
  return (
    isModalOpen.value &&
    (modalType.value === "add-transaction" ||
      modalType.value === "edit-transaction")
  );
});

// Reactive data
const categories = ref<string[]>([]);
const selectedMonth = ref("");
const availableMonths = ref<Array<{ value: string; label: string }>>([]);

// Period selector
const selectedPeriod = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});
const editingTransaction = ref<Transaction | null | undefined>(null);
// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(false);
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

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    // Show all pages if total is 7 or less
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show current page and 2 pages on each side
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const displayedTransactions = computed(() => {
  const filtered = filteredTransactions.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
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

// Period change handler
const handlePeriodChange = async (period: { month: number; year: number }) => {
  console.log("Period changed:", period);
  // Atualizar selectedMonth para manter compatibilidade
  selectedMonth.value = `${period.year}-${period.month
    .toString()
    .padStart(2, "0")}`;
  await loadTransactions();
};

// Data loading
const loadTransactions = async (page: number = 1) => {
  try {
    loading.value = true;
    const startDate = new Date(getYear(), getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(getYear(), getMonth(), 0)
      .toISOString()
      .split("T")[0];

    // Load all transactions for the period (no filters in API)
    const apiFilters: any = {
      startDate,
      endDate,
      page: 1,
      limit: 1000, // Load more to have all data for local filtering
    };

    const response = await transactionStore.fetchTransactions(apiFilters);

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(transactionStore.transactions.map((t) => t.category)),
    ];
    categories.value = uniqueCategories.sort();
  } catch (error) {
    console.error("Error loading transactions:", error);
  } finally {
    loading.value = false;
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
  // Reset pagination when filters change
  currentPage.value = 1;
};

const clearFilters = () => {
  filters.value = {
    type: "",
    status: "",
    category: "",
    search: "",
  };
  // Reset pagination when filters are cleared
  currentPage.value = 1;
};

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = { ...transaction };
  openModal("edit-transaction", transaction);
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

const handleCloseModal = () => {
  closeModal();
  editingTransaction.value = null;
};

const handleOpenAddModal = () => {
  openModal("add-transaction");
};

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const resetPagination = () => {
  currentPage.value = 1;
};

const handleSave = async () => {
  await loadTransactions();
  handleCloseModal();
};

const exportTransactions = () => {
  // Implementation for exporting transactions
  console.log("Exporting transactions...");
};

// Watchers
watch(
  () => selectedPeriod.value,
  () => {
    resetPagination();
    loadTransactions(1);
  }
);

// Lifecycle
onMounted(() => {
  initializeMonths();
  loadTransactions();
});
</script>
