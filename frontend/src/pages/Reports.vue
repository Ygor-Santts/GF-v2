<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p class="mt-1 text-sm text-gray-500">
          Análises detalhadas das suas finanças
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <select v-model="selectedPeriod" @change="loadReports" class="select">
          <option value="current">Mês Atual</option>
          <option value="last3">Últimos 3 Meses</option>
          <option value="last6">Últimos 6 Meses</option>
          <option value="last12">Último Ano</option>
        </select>
        <button @click="exportReport" class="btn-secondary">
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Exportar
        </button>
      </div>
    </div>

    <!-- Period Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <TrendingUpIcon class="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Receita Total</p>
            <p class="text-2xl font-semibold text-success-600">
              {{ formatCurrency(summary.totalIncome) }}
            </p>
            <p class="text-xs text-gray-500">
              <span
                :class="
                  summary.incomeGrowth >= 0
                    ? 'text-success-600'
                    : 'text-danger-600'
                "
              >
                {{ summary.incomeGrowth >= 0 ? "+" : ""
                }}{{ summary.incomeGrowth.toFixed(1) }}%
              </span>
              vs período anterior
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
            <p class="text-sm font-medium text-gray-500">Gastos Totais</p>
            <p class="text-2xl font-semibold text-danger-600">
              {{ formatCurrency(Math.abs(summary.totalExpenses)) }}
            </p>
            <p class="text-xs text-gray-500">
              <span
                :class="
                  summary.expenseGrowth <= 0
                    ? 'text-success-600'
                    : 'text-danger-600'
                "
              >
                {{ summary.expenseGrowth >= 0 ? "+" : ""
                }}{{ summary.expenseGrowth.toFixed(1) }}%
              </span>
              vs período anterior
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
            <p class="text-sm font-medium text-gray-500">Saldo Líquido</p>
            <p
              class="text-2xl font-semibold"
              :class="
                summary.netBalance >= 0 ? 'text-success-600' : 'text-danger-600'
              "
            >
              {{ formatCurrency(summary.netBalance) }}
            </p>
            <p class="text-xs text-gray-500">
              Taxa de poupança: {{ summary.savingsRate.toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <ChartBarIcon class="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Média Mensal</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatCurrency(summary.monthlyAverage) }}
            </p>
            <p class="text-xs text-gray-500">Gasto médio por mês</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly Trend -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Tendência Mensal</h3>
          <div class="flex space-x-2">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800"
            >
              <div class="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
              Receitas
            </span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800"
            >
              <div class="w-2 h-2 bg-danger-500 rounded-full mr-1"></div>
              Gastos
            </span>
          </div>
        </div>
        <div class="h-80">
          <canvas ref="monthlyTrendChart"></canvas>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Distribuição por Categoria
          </h3>
          <select
            v-model="categoryType"
            @change="updateCategoryChart"
            class="select text-sm"
          >
            <option value="EXPENSE">Gastos</option>
            <option value="INCOME">Receitas</option>
          </select>
        </div>
        <div class="h-80">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Top Categories -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Maiores Gastos</h3>
        <div class="space-y-3">
          <div
            v-for="category in topExpenseCategories"
            :key="category.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-3"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="text-sm text-gray-900">{{ category.name }}</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(category.amount) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ category.percentage.toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Comparação Mensal
        </h3>
        <div class="space-y-4">
          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">Melhor Mês</p>
              <p class="text-xs text-gray-500">{{ bestMonth.month }}</p>
            </div>
            <p class="text-sm font-semibold text-success-600">
              {{ formatCurrency(bestMonth.balance) }}
            </p>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">Pior Mês</p>
              <p class="text-xs text-gray-500">{{ worstMonth.month }}</p>
            </div>
            <p class="text-sm font-semibold text-danger-600">
              {{ formatCurrency(worstMonth.balance) }}
            </p>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">Variação</p>
              <p class="text-xs text-gray-500">Diferença entre extremos</p>
            </div>
            <p class="text-sm font-semibold text-gray-900">
              {{
                formatCurrency(Math.abs(bestMonth.balance - worstMonth.balance))
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Financial Goals -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Metas Financeiras
        </h3>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700"
                >Meta de Economia ({{ summary.savingsRate.toFixed(1) }}%)</span
              >
              <span class="text-sm text-gray-500">{{
                formatCurrency(savingsGoal)
              }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="
                  savingsProgress >= 100
                    ? 'bg-success-500'
                    : savingsProgress >= 50
                    ? 'bg-yellow-500'
                    : 'bg-danger-500'
                "
                :style="{ width: Math.min(savingsProgress, 100) + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ savingsProgress.toFixed(1) }}% da meta alcançada
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700"
                >Controle de Gastos (80%)</span
              >
              <span class="text-sm text-gray-500">{{
                formatCurrency(expenseLimit)
              }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="
                  expenseProgress <= 80
                    ? 'bg-success-500'
                    : expenseProgress <= 100
                    ? 'bg-yellow-500'
                    : 'bg-danger-500'
                "
                :style="{ width: Math.min(expenseProgress, 100) + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ expenseProgress.toFixed(1) }}% do limite utilizado
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights and Recommendations -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Insights e Recomendações
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 mb-3">📊 Análises</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li
              v-for="insight in insights"
              :key="insight"
              class="flex items-start"
            >
              <div
                class="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0"
              ></div>
              {{ insight }}
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-gray-900 mb-3">💡 Recomendações</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li
              v-for="recommendation in recommendations"
              :key="recommendation"
              class="flex items-start"
            >
              <div
                class="w-1.5 h-1.5 bg-success-500 rounded-full mt-2 mr-2 flex-shrink-0"
              ></div>
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from "chart.js";
import { computed, nextTick, onMounted, ref } from "vue";
import { useTransactionStore } from "../stores/transactionStore";
import { useDashboardStore } from "../stores/dashboardStore";

Chart.register(...registerables);

// Stores
const transactionStore = useTransactionStore();
const dashboardStore = useDashboardStore();

// Reactive data
const selectedPeriod = ref("current");
const categoryType = ref("EXPENSE");

const topExpenseCategories = ref<
  Array<{ name: string; amount: number; percentage: number; color: string }>
>([]);
const bestMonth = ref({ month: "", balance: 0 });
const worstMonth = ref({ month: "", balance: 0 });
const insights = ref<string[]>([]);
const recommendations = ref<string[]>([]);

// Computed from stores
const summary = computed(() => dashboardStore.summary);

// Chart refs
const monthlyTrendChart = ref<HTMLCanvasElement>();
const categoryChart = ref<HTMLCanvasElement>();

// Chart instances
let monthlyTrendChartInstance: Chart | null = null;
let categoryChartInstance: Chart | null = null;

// Computed properties
const savingsGoal = computed(() => summary.value.totalIncome * 0.2);
const savingsProgress = computed(
  () => (summary.value.netBalance / savingsGoal.value) * 100
);
const expenseLimit = computed(() => summary.value.totalIncome * 0.8);
const expenseProgress = computed(
  () => (Math.abs(summary.value.totalExpenses) / expenseLimit.value) * 100
);

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Data loading
const loadReports = async () => {
  try {
    // Load dashboard data which includes summary and categories
    await dashboardStore.fetchDashboardData({
      period: selectedPeriod.value as any,
    });

    // Process category data from store
    const categories = dashboardStore.expenseCategories;
    const total = categories.reduce(
      (sum: number, cat: any) => sum + Math.abs(cat.amount),
      0
    );

    topExpenseCategories.value = categories
      .slice(0, 5)
      .map((cat: any, index: number) => ({
        name: cat.category,
        amount: Math.abs(cat.amount),
        percentage: (Math.abs(cat.amount) / total) * 100,
        color: getColorForIndex(index),
      }));

    // Generate insights and recommendations
    generateInsights();
    generateRecommendations();

    // Update charts
    await nextTick();
    updateCharts();
  } catch (error) {
    console.error("Error loading reports:", error);
  }
};

const generateInsights = () => {
  const insights = [];

  if (summary.value.savingsRate > 20) {
    insights.push("Excelente! Você está poupando mais de 20% da sua renda.");
  } else if (summary.value.savingsRate > 10) {
    insights.push("Boa taxa de poupança, mas há espaço para melhorar.");
  } else {
    insights.push("Taxa de poupança baixa. Considere revisar seus gastos.");
  }

  if (summary.value.incomeGrowth > 0) {
    insights.push(
      `Sua renda cresceu ${summary.value.incomeGrowth.toFixed(1)}% no período.`
    );
  }

  if (summary.value.expenseGrowth > summary.value.incomeGrowth) {
    insights.push("Seus gastos estão crescendo mais rápido que sua renda.");
  }

  insights.push(
    `Você gasta em média ${formatCurrency(
      summary.value.monthlyAverage
    )} por mês.`
  );

  insights.value = insights;
};

const generateRecommendations = () => {
  const recommendations = [];

  if (summary.value.savingsRate < 20) {
    recommendations.push(
      "Tente economizar pelo menos 10% da sua renda mensal."
    );
  }

  if (topExpenseCategories.value.length > 0) {
    const topCategory = topExpenseCategories.value[0];
    recommendations.push(
      `Revise gastos em ${topCategory.name}, sua maior categoria de despesa.`
    );
  }

  if (summary.value.expenseGrowth > 5) {
    recommendations.push(
      "Controle o crescimento dos gastos para manter o equilíbrio financeiro."
    );
  }

  recommendations.push(
    "Configure transações recorrentes para automatizar seu controle financeiro."
  );
  recommendations.push("Defina metas mensais para cada categoria de gasto.");

  recommendations.value = recommendations;
};

const getColorForIndex = (index: number) => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#6B7280",
  ];
  return colors[index % colors.length];
};

// Chart functions
const updateCharts = () => {
  updateMonthlyTrendChart();
  updateCategoryChart();
};

const updateMonthlyTrendChart = () => {
  if (!monthlyTrendChart.value) return;

  if (monthlyTrendChartInstance) {
    monthlyTrendChartInstance.destroy();
  }

  const ctx = monthlyTrendChart.value.getContext("2d");
  if (!ctx) return;

  // Use real data from store
  const monthlyData = dashboardStore.monthlyData;
  const months = monthlyData.map((item) =>
    dashboardStore.getMonthName(item.month)
  );
  const incomeData = monthlyData.map((item) => item.income);
  const expenseData = monthlyData.map((item) => item.expenses);

  monthlyTrendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Receitas",
          data: incomeData,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Gastos",
          data: expenseData,
          borderColor: "#EF4444",
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
              return formatCurrency(Number(value));
            },
          },
        },
      },
    },
  });
};

const updateCategoryChart = () => {
  if (!categoryChart.value) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = categoryChart.value.getContext("2d");
  if (!ctx) return;

  const labels = topExpenseCategories.value.map((cat) => cat.name);
  const data = topExpenseCategories.value.map((cat) => cat.amount);
  const colors = topExpenseCategories.value.map((cat) => cat.color);

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
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

const exportReport = () => {
  // Implementation for exporting report
  console.log("Exporting report...");
};

// Lifecycle
onMounted(() => {
  loadReports();
});
</script>
