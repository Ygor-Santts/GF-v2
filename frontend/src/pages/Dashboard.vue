<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Header -->
    <div
      class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Bem-vindo de volta! 👋</h1>
          <p class="text-blue-100 text-lg">
            Aqui está um resumo das suas finanças
          </p>
        </div>
        <div class="hidden md:block">
          <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Calendar class="w-8 h-8 text-white mb-2" />
            <p class="text-sm text-blue-100">{{ currentDate }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Receitas -->
      <div
        class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-emerald-100 rounded-xl">
            <TrendingUp class="w-6 h-6 text-emerald-600" />
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-500">Receitas</p>
            <p class="text-2xl font-bold text-slate-800">
              R$ {{ formatCurrency(stats.totalIncome) }}
            </p>
          </div>
        </div>
        <div class="flex items-center text-sm">
          <ArrowUpRight class="w-4 h-4 text-emerald-500 mr-1" />
          <span class="text-emerald-600 font-medium">+12%</span>
          <span class="text-slate-500 ml-1">vs mês anterior</span>
        </div>
      </div>

      <!-- Despesas -->
      <div
        class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-red-100 rounded-xl">
            <TrendingDown class="w-6 h-6 text-red-600" />
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-500">Despesas</p>
            <p class="text-2xl font-bold text-slate-800">
              R$ {{ formatCurrency(stats.totalExpenses) }}
            </p>
          </div>
        </div>
        <div class="flex items-center text-sm">
          <ArrowDownRight class="w-4 h-4 text-red-500 mr-1" />
          <span class="text-red-600 font-medium">-8%</span>
          <span class="text-slate-500 ml-1">vs mês anterior</span>
        </div>
      </div>

      <!-- Saldo -->
      <div
        class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-xl">
            <Banknote class="w-6 h-6 text-blue-600" />
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-500">Saldo</p>
            <p class="text-2xl font-bold text-slate-800">
              R$ {{ formatCurrency(stats.balance) }}
            </p>
          </div>
        </div>
        <div class="flex items-center text-sm">
          <ArrowUpRight class="w-4 h-4 text-blue-500 mr-1" />
          <span class="text-blue-600 font-medium">Positivo</span>
        </div>
      </div>

      <!-- Transações -->
      <div
        class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-100 rounded-xl">
            <CreditCard class="w-6 h-6 text-purple-600" />
          </div>
          <div class="text-right">
            <p class="text-sm text-slate-500">Transações</p>
            <p class="text-2xl font-bold text-slate-800">
              {{ stats.totalTransactions }}
            </p>
          </div>
        </div>
        <div class="flex items-center text-sm">
          <span class="text-slate-500">Este mês</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Monthly Trend Chart -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-slate-800">Tendência Mensal</h3>
          <div class="flex items-center space-x-2">
            <BarChart3 class="w-5 h-5 text-slate-400" />
            <select
              v-model="selectedMonth"
              @change="loadMonthlyData"
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
        <div class="h-80">
          <canvas ref="monthlyChart"></canvas>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-slate-800">
            Distribuição por Categoria
          </h3>
          <div class="flex items-center space-x-2">
            <PieChart class="w-5 h-5 text-slate-400" />
            <select
              v-model="categoryPeriod"
              @change="loadCategoryData"
              class="text-sm border-0 bg-slate-50 rounded-lg px-3 py-1"
            >
              <option value="current">Mês Atual</option>
              <option value="last3">Últimos 3 Meses</option>
            </select>
          </div>
        </div>
        <div class="h-80">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-2xl shadow-lg border border-slate-100">
      <div class="p-6 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-slate-800">
            Transações Recentes
          </h3>
          <div class="flex items-center space-x-3">
            <button
              @click="loadData"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw class="w-5 h-5" />
            </button>
            <router-link
              to="/transactions"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye class="w-4 h-4 mr-2" />
              Ver Todas
            </router-link>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <div
          v-else-if="recentTransactions.length === 0"
          class="text-center py-8"
        >
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
                  transaction.type === 'INCOME'
                    ? 'bg-emerald-100'
                    : 'bg-red-100'
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
                  formatCurrency(
                    transaction.amount || transaction.plannedAmount
                  )
                }}
              </p>
              <p class="text-sm text-slate-500 capitalize">
                {{ transaction.category }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import api from "../api/http";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  PieChart,
  RotateCcw,
  Calendar,
  CreditCard,
  BarChart3,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-vue-next";

Chart.register(...registerables);

// Reactive data
const loading = ref(true);
const data = ref<any>(null);
const recentTransactions = ref<any[]>([]);
const stats = ref<any>({});
const selectedMonth = ref("");
const categoryPeriod = ref("current");

// Chart refs
const monthlyChart = ref<HTMLCanvasElement>();
const categoryChart = ref<HTMLCanvasElement>();

// Chart instances
let monthlyChartInstance: Chart | null = null;
let categoryChartInstance: Chart | null = null;

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const availableMonths = computed(() => {
  if (!data.value?.monthlyData) return [];
  return data.value.monthlyData.map((item: any) => item.month);
});

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const formatMonth = (month: string) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const loadData = async () => {
  try {
    loading.value = true;
    const response = await api.get("/api/reports/dashboard");
    data.value = response.data;

    stats.value = {
      totalIncome: data.value.summary?.totalIncome || 0,
      totalExpenses: data.value.summary?.totalExpenses || 0,
      balance:
        (data.value.summary?.totalIncome || 0) -
        (data.value.summary?.totalExpenses || 0),
      totalTransactions: data.value.recentTransactions?.length || 0,
    };

    recentTransactions.value = data.value.recentTransactions || [];

    await nextTick();
    createCharts();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    loading.value = false;
  }
};

const loadMonthlyData = async () => {
  await loadData();
};

const loadCategoryData = async () => {
  await loadData();
};

const createCharts = () => {
  createMonthlyChart();
  createCategoryChart();
};

const createMonthlyChart = () => {
  if (!monthlyChart.value || !data.value?.monthlyData) return;

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  const ctx = monthlyChart.value.getContext("2d");
  if (!ctx) return;

  const monthlyData = data.value.monthlyData || [];

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
              return (
                "R$ " + new Intl.NumberFormat("pt-BR").format(value as number)
              );
            },
          },
        },
      },
    },
  });
};

const createCategoryChart = () => {
  if (!categoryChart.value || !data.value?.categoryData) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = categoryChart.value.getContext("2d");
  if (!ctx) return;

  const categoryData = data.value.categoryData || [];

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
  loadData();
});
</script>
