<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <PageHeader
      title="Transações Recorrentes"
      subtitle="Gerencie suas receitas e despesas que se repetem mensalmente"
      :background-icon="RotateCcw"
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
            :icon="Plus"
            text="Nova Recorrente"
            @click="showAddModal = true"
          />
        </div>
      </template>
    </PageHeader>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        label="Receitas Recorrentes"
        :value="totalRecurringIncome"
        :icon="ArrowUpCircle"
        icon-color="emerald"
        value-color="success"
        format="currency"
        :subtitle="`${recurringIncomeCount} transações`"
        :animate="true"
        :delay="0"
      />

      <MetricCard
        label="Gastos Recorrentes"
        :value="Math.abs(totalRecurringExpenses)"
        :icon="ArrowDownCircle"
        icon-color="red"
        value-color="danger"
        format="currency"
        :subtitle="`${recurringExpensesCount} transações`"
        :animate="true"
        :delay="1"
      />

      <MetricCard
        label="Saldo Mensal"
        :value="monthlyBalance"
        :icon="Scale"
        icon-color="blue"
        :value-color="monthlyBalance >= 0 ? 'success' : 'danger'"
        format="currency"
        subtitle="Impacto mensal"
        :animate="true"
        :delay="2"
      />
    </div>

    <!-- Recurring Transactions List -->
    <Card
      title="Transações Recorrentes"
      :padding="'lg'"
      :rounded="'2xl'"
      :shadow="'lg'"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-slate-900">
              Transações Recorrentes
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              Gerencie suas transações que se repetem mensalmente
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <Select
              v-model="filterType"
              :options="filterOptions"
              placeholder="Todos os tipos"
              size="sm"
            />
            <Button
              variant="secondary"
              :icon="Calendar"
              text="Gerar Próximo Mês"
              size="sm"
              @click="generateNextMonth"
            />
          </div>
        </div>
      </template>

      <div
        v-if="filteredRecurring.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <RecurringCard
          v-for="recurring in filteredRecurring"
          :key="recurring._id"
          :recurring="recurring"
          @edit="editRecurring"
          @toggle="toggleRecurring"
          @delete="deleteRecurring"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div
          class="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6"
        >
          <RotateCcw class="w-12 h-12 text-slate-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">
          Nenhuma transação recorrente
        </h3>
        <p class="text-slate-500 mb-6 max-w-sm mx-auto">
          Comece criando sua primeira transação recorrente para automatizar suas
          finanças.
        </p>
        <Button
          variant="primary"
          :icon="Plus"
          text="Nova Recorrente"
          @click="showAddModal = true"
        />
      </div>
    </Card>

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
import RecurringCard from "../components/RecurringCard.vue";
import {
  Card,
  Button,
  MetricCard,
  PageHeader,
  Select,
  PeriodSelector,
} from "../components/ui";
import {
  RotateCcw,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Scale,
  Calendar,
} from "lucide-vue-next";
// Types
interface RecurringTransaction {
  _id?: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// Store
const recurringStore = useRecurringStore();

// Reactive data
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingRecurring = ref<RecurringTransaction | null>(null);
const filterType = ref("");

// Period selector
const selectedPeriod = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

// Filter options
const filterOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "INCOME", label: "Receitas" },
  { value: "EXPENSE", label: "Gastos" },
];

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

// Period change handler
const handlePeriodChange = async (period: { month: number; year: number }) => {
  console.log("Period changed:", period);
  // Para transações recorrentes, o período selecionado pode ser usado para:
  // 1. Filtrar transações que se aplicam ao período selecionado
  // 2. Mostrar projeções para o período selecionado
  // 3. Gerar transações para o período selecionado
  // Por enquanto, apenas logamos a mudança
};

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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
