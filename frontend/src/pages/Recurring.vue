<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transações Recorrentes</h1>
        <p class="mt-1 text-sm text-gray-500">
          Gerencie suas receitas e despesas que se repetem mensalmente
        </p>
      </div>
      <button @click="showAddModal = true" class="mt-4 sm:mt-0 btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Nova Recorrente
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <ArrowPathIcon class="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Receitas Recorrentes
            </p>
            <p class="text-2xl font-semibold text-success-600">
              {{ formatCurrency(totalRecurringIncome) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ recurringIncomeCount }} transações
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
              <ArrowPathIcon class="w-5 h-5 text-danger-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Gastos Recorrentes</p>
            <p class="text-2xl font-semibold text-danger-600">
              {{ formatCurrency(Math.abs(totalRecurringExpenses)) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ recurringExpensesCount }} transações
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
            <p class="text-sm font-medium text-gray-500">Saldo Mensal</p>
            <p
              class="text-2xl font-semibold"
              :class="
                monthlyBalance >= 0 ? 'text-success-600' : 'text-danger-600'
              "
            >
              {{ formatCurrency(monthlyBalance) }}
            </p>
            <p class="text-xs text-gray-500">Impacto mensal</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recurring Transactions List -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">
          Transações Recorrentes
        </h3>
        <div class="flex items-center space-x-3">
          <select v-model="filterType" class="select text-sm">
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Gastos</option>
          </select>
          <button @click="generateNextMonth" class="btn-secondary text-sm">
            <CalendarIcon class="w-4 h-4 mr-2" />
            Gerar Próximo Mês
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="recurring in filteredRecurring"
          :key="recurring._id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span
                  class="badge"
                  :class="
                    recurring.type === 'INCOME'
                      ? 'badge-success'
                      : 'badge-danger'
                  "
                >
                  <ArrowUpIcon
                    v-if="recurring.type === 'INCOME'"
                    class="w-3 h-3 mr-1"
                  />
                  <ArrowDownIcon v-else class="w-3 h-3 mr-1" />
                  {{ recurring.type === "INCOME" ? "Receita" : "Gasto" }}
                </span>
                <span v-if="recurring.isActive" class="badge badge-success"
                  >Ativo</span
                >
                <span v-else class="badge bg-gray-100 text-gray-800"
                  >Inativo</span
                >
              </div>

              <h4 class="font-medium text-gray-900 mb-1">
                {{ recurring.description || recurring.category }}
              </h4>
              <p class="text-sm text-gray-500 mb-2">{{ recurring.category }}</p>

              <div class="flex items-center justify-between">
                <span
                  class="text-lg font-semibold"
                  :class="
                    recurring.type === 'INCOME'
                      ? 'text-success-600'
                      : 'text-danger-600'
                  "
                >
                  {{ formatCurrency(Math.abs(recurring.amount || 0)) }}
                </span>
                <div class="flex items-center text-xs text-gray-500">
                  <CalendarIcon class="w-3 h-3 mr-1" />
                  Dia {{ recurring.dayOfMonth || 1 }}
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1 ml-2">
              <button
                @click="editRecurring(recurring)"
                class="p-1 text-gray-400 hover:text-primary-600"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="toggleRecurring(recurring)"
                class="p-1 text-gray-400 hover:text-yellow-600"
              >
                <PauseIcon v-if="recurring.isActive" class="w-4 h-4" />
                <PlayIcon v-else class="w-4 h-4" />
              </button>
              <button
                @click="deleteRecurring(recurring)"
                class="p-1 text-gray-400 hover:text-danger-600"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Next occurrence -->
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div
              class="flex items-center justify-between text-xs text-gray-500"
            >
              <span>Próxima ocorrência:</span>
              <span class="font-medium">{{
                getNextOccurrence(recurring)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredRecurring.length === 0" class="text-center py-12">
        <ArrowPathIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          Nenhuma transação recorrente
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece criando sua primeira transação recorrente.
        </p>
        <div class="mt-6">
          <button @click="showAddModal = true" class="btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nova Recorrente
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Recurring Modal -->
    <RecurringModal
      :show="showAddModal || showEditModal"
      :recurring="editingRecurring"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRecurringStore } from "../stores/recurringStore";
import RecurringModal from "../components/RecurringModal.vue";
// Types
interface RecurringTransaction {
  _id?: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

// Store
const recurringStore = useRecurringStore();

// Reactive data
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingRecurring = ref<RecurringTransaction | null>(null);
const filterType = ref("");

// Computed properties
const filteredRecurring = computed(() => {
  if (!filterType.value) return recurringStore.recurringTransactions;
  return recurringStore.recurringTransactions.filter(
    (r) => r.type === filterType.value
  );
});

const totalRecurringIncome = computed(() => recurringStore.totalMonthlyIncome);

const totalRecurringExpenses = computed(
  () => recurringStore.totalMonthlyExpenses
);

const monthlyBalance = computed(() => recurringStore.monthlyBalance);

const recurringIncomeCount = computed(
  () => recurringStore.incomeRecurring.length
);

const recurringExpensesCount = computed(
  () => recurringStore.expenseRecurring.length
);

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getNextOccurrence = (recurring: RecurringTransaction) => {
  const now = new Date();
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    recurring.dayOfMonth
  );

  // If the day has already passed this month, show next month
  if (now.getDate() > recurring.dayOfMonth) {
    return nextMonth.toLocaleDateString("pt-BR");
  } else {
    const thisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      recurring.dayOfMonth
    );
    return thisMonth.toLocaleDateString("pt-BR");
  }
};

// Data loading
const loadRecurringTransactions = async () => {
  try {
    await recurringStore.fetchRecurringTransactions();
  } catch (error) {
    console.error("Error loading recurring transactions:", error);
  }
};

// Actions
const editRecurring = (recurring: RecurringTransaction) => {
  editingRecurring.value = { ...recurring };
  showEditModal.value = true;
};

const deleteRecurring = async (recurring: RecurringTransaction) => {
  if (!confirm("Tem certeza que deseja excluir esta transação recorrente?"))
    return;

  try {
    await recurringStore.deleteRecurring(recurring._id!);
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
  }
};

const toggleRecurring = async (recurring: RecurringTransaction) => {
  try {
    await recurringStore.toggleActive(recurring._id!, !recurring.isActive);
  } catch (error) {
    console.error("Error toggling recurring transaction:", error);
  }
};

const generateNextMonth = async () => {
  if (!confirm("Gerar transações recorrentes para o próximo mês?")) return;

  try {
    const result = await recurringStore.processRecurring();
    alert(
      `Transações recorrentes processadas! ${result.created} novas transações criadas.`
    );
  } catch (error) {
    console.error("Error generating recurring transactions:", error);
    alert("Erro ao gerar transações recorrentes");
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingRecurring.value = null;
};

const handleSave = async () => {
  await loadRecurringTransactions();
  closeModal();
};

// Lifecycle
onMounted(() => {
  loadRecurringTransactions();
});
</script>
