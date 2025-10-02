<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Financiamentos</h1>
        <p class="mt-1 text-sm text-gray-500">
          Gerencie seus financiamentos e empréstimos
        </p>
      </div>
      <button @click="showAddModal = true" class="mt-4 sm:mt-0 btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Financiamento
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <DocumentTextIcon class="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Total Financiamentos
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ financings.length }}
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
              <BanknotesIcon class="w-5 h-5 text-danger-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Saldo Devedor</p>
            <p class="text-2xl font-semibold text-danger-600">
              {{ formatCurrency(totalOutstandingBalance) }}
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
              <CalendarIcon class="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Parcela Mensal</p>
            <p class="text-2xl font-semibold text-yellow-600">
              {{ formatCurrency(totalMonthlyPayment) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center"
            >
              <CheckCircleIcon class="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Valor Pago</p>
            <p class="text-2xl font-semibold text-success-600">
              {{ formatCurrency(totalPaidAmount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Financings List -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="financing in financings"
        :key="financing._id"
        class="card hover:shadow-lg transition-shadow duration-200"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              {{ financing.description }}
            </h3>
            <p class="text-sm text-gray-500">{{ financing.type }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              class="badge"
              :class="
                financing.status === 'ACTIVE'
                  ? 'badge-success'
                  : financing.status === 'COMPLETED'
                  ? 'badge-info'
                  : 'badge-warning'
              "
            >
              {{ getStatusLabel(financing.status) }}
            </span>
            <div class="flex items-center space-x-1">
              <button
                @click="editFinancing(financing)"
                class="p-1 text-gray-400 hover:text-primary-600"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="deleteFinancing(financing)"
                class="p-1 text-gray-400 hover:text-danger-600"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div
            class="flex items-center justify-between text-sm text-gray-600 mb-1"
          >
            <span>Progresso</span>
            <span
              >{{ financing.paidInstallments }}/{{
                financing.totalInstallments
              }}
              parcelas</span
            >
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: getProgressPercentage(financing) + '%' }"
            ></div>
          </div>
          <div
            class="flex items-center justify-between text-xs text-gray-500 mt-1"
          >
            <span
              >{{ getProgressPercentage(financing).toFixed(1) }}%
              concluído</span
            >
            <span
              >{{ getRemainingInstallments(financing) }} parcelas
              restantes</span
            >
          </div>
        </div>

        <!-- Financial Details -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500">Valor Original</p>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatCurrency(financing.originalAmount) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Saldo Devedor</p>
            <p class="text-sm font-semibold text-danger-600">
              {{ formatCurrency(financing.outstandingBalance) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Parcela</p>
            <p class="text-sm font-semibold text-yellow-600">
              {{ formatCurrency(financing.installmentAmount) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Taxa de Juros</p>
            <p class="text-sm font-semibold text-gray-900">
              {{ financing.interestRate }}% a.m.
            </p>
          </div>
        </div>

        <!-- Dates -->
        <div
          class="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3"
        >
          <div>
            <span class="font-medium">Início:</span>
            {{ formatDate(financing.startDate) }}
          </div>
          <div>
            <span class="font-medium">Próximo vencimento:</span>
            {{ getNextDueDate(financing) }}
          </div>
        </div>

        <!-- Actions -->
        <div
          class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"
        >
          <button @click="viewDetails(financing)" class="btn-secondary text-sm">
            <EyeIcon class="w-4 h-4 mr-2" />
            Ver Detalhes
          </button>
          <button
            v-if="financing.status === 'ACTIVE'"
            @click="payInstallment(financing)"
            class="btn-success text-sm"
          >
            <CreditCardIcon class="w-4 h-4 mr-2" />
            Pagar Parcela
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="financings.length === 0" class="card text-center py-12">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">
        Nenhum financiamento cadastrado
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Comece adicionando seu primeiro financiamento.
      </p>
      <div class="mt-6">
        <button @click="showAddModal = true" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo Financiamento
        </button>
      </div>
    </div>

    <!-- Add/Edit Financing Modal -->
    <FinancingModal
      :show="showAddModal || showEditModal"
      :financing="editingFinancing"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Financing Details Modal -->
    <FinancingDetailsModal
      :show="showDetailsModal"
      :financing="selectedFinancing"
      @close="showDetailsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "../api/http";

// Types
interface Financing {
  _id?: string;
  description: string;
  type: string;
  originalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  startDate: string;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
}

// Reactive data
const financings = ref<Financing[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const editingFinancing = ref<Financing | null>(null);
const selectedFinancing = ref<Financing | null>(null);

// Computed properties
const totalOutstandingBalance = computed(() => {
  return financings.value
    .filter((f) => f.status === "ACTIVE")
    .reduce((sum, f) => sum + f.outstandingBalance, 0);
});

const totalMonthlyPayment = computed(() => {
  return financings.value
    .filter((f) => f.status === "ACTIVE")
    .reduce((sum, f) => sum + f.installmentAmount, 0);
});

const totalPaidAmount = computed(() => {
  return financings.value.reduce((sum, f) => {
    return sum + f.paidInstallments * f.installmentAmount;
  }, 0);
});

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

const getStatusLabel = (status: string) => {
  const labels = {
    ACTIVE: "Ativo",
    COMPLETED: "Quitado",
    SUSPENDED: "Suspenso",
  };
  return labels[status as keyof typeof labels] || status;
};

const getProgressPercentage = (financing: Financing) => {
  return (financing.paidInstallments / financing.totalInstallments) * 100;
};

const getRemainingInstallments = (financing: Financing) => {
  return financing.totalInstallments - financing.paidInstallments;
};

const getNextDueDate = (financing: Financing) => {
  const startDate = new Date(financing.startDate);
  const nextMonth = new Date(startDate);
  nextMonth.setMonth(startDate.getMonth() + financing.paidInstallments + 1);
  return nextMonth.toLocaleDateString("pt-BR");
};

// Data loading
const loadFinancings = async () => {
  try {
    const response = await api.get("/api/financing");
    financings.value = response.data;
  } catch (error) {
    console.error("Error loading financings:", error);
  }
};

// Actions
const editFinancing = (financing: Financing) => {
  editingFinancing.value = { ...financing };
  showEditModal.value = true;
};

const deleteFinancing = async (financing: Financing) => {
  if (!confirm("Tem certeza que deseja excluir este financiamento?")) return;

  try {
    await api.delete(`/api/financing/${financing._id}`);
    await loadFinancings();
  } catch (error) {
    console.error("Error deleting financing:", error);
  }
};

const viewDetails = (financing: Financing) => {
  selectedFinancing.value = financing;
  showDetailsModal.value = true;
};

const payInstallment = async (financing: Financing) => {
  if (
    !confirm(
      `Confirmar pagamento da parcela de ${formatCurrency(
        financing.installmentAmount
      )}?`
    )
  )
    return;

  try {
    await api.post(`/api/financing/${financing._id}/pay`);
    await loadFinancings();
    alert("Parcela paga com sucesso!");
  } catch (error) {
    console.error("Error paying installment:", error);
    alert("Erro ao pagar parcela");
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingFinancing.value = null;
};

const handleSave = async () => {
  await loadFinancings();
  closeModal();
};

// Lifecycle
onMounted(() => {
  loadFinancings();
});
</script>
