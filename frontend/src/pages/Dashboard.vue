<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Header -->
    <PageHeader
      title="Bem-vindo de volta! 👋"
      subtitle="Aqui está um resumo das suas finanças"
      :background-icon="BarChart2"
      variant="blue"
    >
      <template #actions>
        <div class="hidden md:block">
          <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <PeriodSelector
              v-model="selectedPeriod"
              @change="handlePeriodChange"
              class="text-white"
            />
          </div>
        </div>
      </template>
    </PageHeader>

    <!-- Stats Cards -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
    >
      <!-- Receitas -->
      <MetricCard
        label="Receitas"
        :value="stats.totalIncome"
        :icon="TrendingUp"
        icon-color="emerald"
        :format="'currency'"
        :trend="'up'"
        :trend-text="`+${stats.incomeGrowth}%`"
        subtitle="vs mês anterior"
        :trend-icon="ArrowUpRight"
        :animate="true"
        :delay="1"
      />

      <!-- Despesas -->
      <MetricCard
        label="Despesas"
        :value="stats.totalExpenses"
        :icon="TrendingDown"
        icon-color="red"
        :format="'currency'"
        :trend="'down'"
        :trend-text="`${stats.expenseGrowth}%`"
        subtitle="vs mês anterior"
        :trend-icon="ArrowDownRight"
        :animate="true"
        :delay="2"
      />

      <!-- Saldo -->
      <MetricCard
        label="Saldo"
        :value="stats.netBalance"
        :icon="Banknote"
        icon-color="blue"
        :format="'currency'"
        :value-color="stats.netBalance >= 0 ? 'success' : 'danger'"
        :trend="stats.netBalance >= 0 ? 'up' : 'down'"
        :trend-text="stats.netBalance >= 0 ? 'Positivo' : 'Negativo'"
        :trend-icon="stats.netBalance >= 0 ? ArrowUpRight : ArrowDownRight"
        :animate="true"
        :delay="3"
      />

      <!-- Transações -->
      <MetricCard
        label="Transações"
        :value="totalTransactions"
        :icon="CreditCard"
        icon-color="purple"
        :format="'number'"
        subtitle="Este mês"
        :animate="true"
        :delay="4"
      />

      <!-- Receitas Pagas -->
      <MetricCard
        label="Receitas Pagas"
        :value="incomeTransactions"
        :icon="CheckCircle"
        icon-color="emerald"
        :format="'number'"
        subtitle="Entradas confirmadas"
        :animate="true"
        :delay="5"
      />

      <!-- Pendentes -->
      <MetricCard
        label="Pendentes"
        :value="plannedTransactions"
        :icon="Clock"
        icon-color="amber"
        :format="'number'"
        subtitle="Aguardando pagamento"
        :animate="true"
        :delay="6"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Monthly Trend Chart -->
      <Card title="Tendência Mensal" :animate="true" :delay="7">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-slate-800">
              Tendência Mensal
            </h3>
            <div class="flex items-center space-x-2">
              <BarChart3 class="w-5 h-5 text-slate-400" />
              <select
                v-model="selectedMonth"
                @change="refreshData"
                class="text-sm border-0 bg-slate-50 rounded-lg px-3 py-1"
              >
                <option value="">Todos os meses</option>
                <option
                  v-for="month in availableMonths"
                  :key="month"
                  :value="month"
                >
                  {{ formatMonth(month) }}
                </option>
              </select>
            </div>
          </div>
        </template>
        <div class="h-80">
          <canvas ref="monthlyChart"></canvas>
        </div>
      </Card>

      <!-- Category Distribution -->
      <Card title="Distribuição por Categoria" :animate="true" :delay="8">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-slate-800">
              Distribuição por Categoria
            </h3>
            <div class="flex items-center space-x-2">
              <PieChart class="w-5 h-5 text-slate-400" />
              <select
                v-model="categoryPeriod"
                @change="refreshData"
                class="text-sm border-0 bg-slate-50 rounded-lg px-3 py-1"
              >
                <option value="current">Mês Atual</option>
                <option value="last3">Últimos 3 Meses</option>
              </select>
            </div>
          </div>
        </template>
        <div class="h-80">
          <canvas ref="categoryChart"></canvas>
        </div>
      </Card>
    </div>

    <!-- Recent Transactions -->
    <Card title="Transações Recentes" :animate="true" :delay="9">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-slate-800">
            Transações Recentes
          </h3>
          <div class="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              @click="refreshData"
              :icon="RotateCcw"
              text="Atualizar"
            />
            <Button
              variant="primary"
              size="sm"
              @click="$router.push('/transactions')"
              :icon="Eye"
            >
              Ver Todas
            </Button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>

      <div v-else-if="recentTransactions.length === 0" class="text-center py-8">
        <CreditCard class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p class="text-slate-500">Nenhuma transação encontrada</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="transaction in recentTransactions"
          :key="transaction._id"
          class="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div
              class="p-2 rounded-lg"
              :class="
                transaction.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'
              "
            >
              <TrendingUp
                v-if="transaction.type === 'INCOME'"
                class="w-5 h-5 text-emerald-600"
              />
              <TrendingDown v-else class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p class="font-medium text-slate-800">
                {{ transaction.description || transaction.category }}
              </p>
              <p class="text-sm text-slate-500">
                {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p
              class="font-semibold"
              :class="
                transaction.type === 'INCOME'
                  ? 'text-emerald-600'
                  : 'text-red-600'
              "
            >
              {{ transaction.type === "INCOME" ? "+" : "-" }}R$
              {{
                formatCurrency(transaction.amount || transaction.plannedAmount)
              }}
            </p>
            <p class="text-sm text-slate-500 capitalize">
              {{ transaction.category }}
            </p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link
        to="/transactions"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold mb-2">Nova Receita</h4>
            <p class="text-emerald-100">Adicionar entrada de dinheiro</p>
          </div>
          <Plus class="w-8 h-8" />
        </div>
      </router-link>

      <router-link
        to="/transactions"
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold mb-2">Nova Despesa</h4>
            <p class="text-red-100">Registrar gasto</p>
          </div>
          <Plus class="w-8 h-8" />
        </div>
      </router-link>

      <router-link
        to="/reports"
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold mb-2">Ver Relatórios</h4>
            <p class="text-blue-100">Análises detalhadas</p>
          </div>
          <BarChart3 class="w-8 h-8" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { Chart, registerables } from "chart.js";
import { useDashboardStore } from "../stores/dashboardStore";
import {
  Button,
  Card,
  Badge,
  MetricCard,
  PageHeader,
  PeriodSelector,
} from "../components/ui";
import {
  BarChart2,
  RefreshCw,
  Wallet,
  ArrowUp,
  ArrowDown,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Hourglass,
  Clock,
  Plus,
  Banknote,
  PieChart,
  RotateCcw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  CheckCircle,
  Eye,
} from "lucide-vue-next";

Chart.register(...registerables);

// Store
const dashboardStore = useDashboardStore();

// Local reactive data
const selectedMonth = ref("");
const categoryPeriod = ref("current");

// Period selector
const selectedPeriod = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

// Chart refs
const monthlyChartCanvas = ref<HTMLCanvasElement>();
const categoryChartCanvas = ref<HTMLCanvasElement>();

// Chart instances
let monthlyChartInstance: Chart | null = null;
let categoryChartInstance: Chart | null = null;

// Local state
const categoryType = ref<"INCOME" | "EXPENSE">("EXPENSE");

// Computed from store
const loading = computed(() => dashboardStore.loading);
const stats = computed(() => ({
  totalIncome: dashboardStore.summary.totalIncome,
  totalExpenses: dashboardStore.summary.totalExpenses,
  netBalance: dashboardStore.summary.netBalance,
  incomeGrowth: 0,
  expenseGrowth: 0,
  pendingTransactions: dashboardStore.recentTransactions.filter(
    (t) => t.status === "PLANNED"
  ).length,
}));
const recentTransactions = computed(() => dashboardStore.recentTransactions);
const availableMonths = computed(() =>
  dashboardStore.monthlyData.map((item) => item.month)
);

// Métricas de contagem
const totalTransactions = computed(() => dashboardStore.totalTransactions);
const incomeTransactions = computed(() => dashboardStore.incomeTransactions);
const expenseTransactions = computed(() => dashboardStore.expenseTransactions);
const paidTransactions = computed(() => dashboardStore.paidTransactions);
const plannedTransactions = computed(() => dashboardStore.plannedTransactions);

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Period change handler
const handlePeriodChange = async (period: { month: number; year: number }) => {
  console.log("Period changed:", period);
  await dashboardStore.fetchDashboardDataForPeriod(period.year, period.month);
};

// Methods
const formatCurrency = (value: number) => {
  return dashboardStore.formatCurrency(value || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const formatMonth = (month: string) => {
  return dashboardStore.getMonthName(month);
};

const refreshData = async () => {
  await dashboardStore.fetchDashboardData();
  await nextTick();
  createCharts();
};

const renderCategoryChart = () => {
  createCategoryChart();
};

const createCharts = () => {
  createMonthlyChart();
  createCategoryChart();
};

const createMonthlyChart = () => {
  if (!monthlyChartCanvas.value || dashboardStore.monthlyData.length === 0)
    return;

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  const ctx = monthlyChartCanvas.value.getContext("2d");
  if (!ctx) return;

  const monthlyData = dashboardStore.monthlyData;

  monthlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthlyData.map((item: any) => formatMonth(item.month)),
      datasets: [
        {
          label: "Receitas",
          data: monthlyData.map((item: any) => item.income),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Despesas",
          data: monthlyData.map((item: any) => item.expenses),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return dashboardStore.formatCurrency(value as number);
            },
          },
        },
      },
    },
  });
};

const createCategoryChart = () => {
  if (!categoryChartCanvas.value || dashboardStore.categoryData.length === 0)
    return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = categoryChartCanvas.value.getContext("2d");
  if (!ctx) return;

  const categoryData = dashboardStore.categoryData;

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categoryData.map((item: any) => item.category),
      datasets: [
        {
          data: categoryData.map((item: any) => item.amount),
          backgroundColor: [
            "#3b82f6",
            "#ef4444",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#06b6d4",
            "#84cc16",
            "#f97316",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

onMounted(() => {
  refreshData();
});
</script>
