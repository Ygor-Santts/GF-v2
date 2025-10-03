<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <PageHeader
      title="Financiamentos"
      subtitle="Gerencie seus financiamentos e empréstimos"
      :backgroundIcon="FileText"
      variant="blue"
    />

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        label="Total Financiamentos"
        :value="financings.length.toString()"
        :icon="FileText"
        variant="elevated"
      />
      <MetricCard
        label="Saldo Devedor"
        :value="formatCurrency(totalOutstandingBalance)"
        :icon="DollarSign"
        variant="elevated"
      />
      <MetricCard
        label="Parcela Mensal"
        :value="formatCurrency(totalMonthlyPayment)"
        :icon="Calendar"
        variant="elevated"
      />
      <MetricCard
        label="Valor Pago"
        :value="formatCurrency(totalPaidAmount)"
        :icon="CheckCircle"
        variant="elevated"
      />
    </div>

    <!-- Financings List -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Meus Financiamentos
          </h3>
          <Button @click="showAddModal = true" :icon="Plus">
            Novo Financiamento
          </Button>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="financing in financings"
          :key="financing._id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900 mb-1">
                {{ financing.description }}
              </h4>
              <Badge :variant="getTypeVariant(financing.type)">
                {{ getTypeLabel(financing.type) }}
              </Badge>
            </div>
            <div class="flex items-center space-x-2">
              <Badge :variant="getStatusVariant(financing)">
                {{ getStatusLabel(financing) }}
              </Badge>
              <div class="flex items-center space-x-1">
                <Button
                  @click="editFinancing(financing)"
                  variant="ghost"
                  size="sm"
                  :icon="Edit"
                />
                <Button
                  @click="deleteFinancing(financing)"
                  variant="ghost"
                  size="sm"
                  :icon="Trash2"
                />
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div
              class="flex items-center justify-between text-sm text-gray-600 mb-1"
            >
              <span>Progresso</span>
              <span>
                {{ financing.paidInstallments }}/{{
                  financing.totalInstallments
                }}
                parcelas
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-500"
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
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p class="text-xs text-gray-500">Valor Original</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(financing.originalAmount) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Saldo Devedor</p>
              <p class="text-sm font-semibold text-red-600">
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
            <Button
              @click="viewDetails(financing)"
              variant="secondary"
              size="sm"
              :icon="Eye"
            >
              Ver Detalhes
            </Button>
            <Button
              v-if="
                financing.isActive &&
                financing.paidInstallments < financing.totalInstallments
              "
              @click="payInstallment(financing)"
              variant="success"
              size="sm"
              :icon="CreditCard"
            >
              Pagar Parcela
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="financings.length === 0" class="text-center py-12">
        <FileText class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          Nenhum financiamento cadastrado
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece adicionando seu primeiro financiamento.
        </p>
        <div class="mt-6">
          <Button @click="showAddModal = true" :icon="Plus">
            Novo Financiamento
          </Button>
        </div>
      </div>
    </Card>

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
import { useFinancingStore } from "../stores/financingStore";
import { FinancingModal, FinancingDetailsModal } from "../components/ui";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  CreditCard,
} from "lucide-vue-next";
import { PageHeader, Card, Button, Badge, MetricCard } from "../components/ui";
import type { Financing } from "../services/financingService";

// Store
const financingStore = useFinancingStore();

// Reactive data
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const editingFinancing = ref<Financing | null>(null);
const selectedFinancing = ref<Financing | null>(null);

// Computed properties
const financings = computed(() => financingStore.financings);
const totalOutstandingBalance = computed(
  () => financingStore.totalOutstandingBalance
);
const totalMonthlyPayment = computed(() => financingStore.totalMonthlyPayments);
const totalPaidAmount = computed(() => financingStore.totalPaidAmount);

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

const getTypeLabel = (type: string) => {
  const labels = {
    LOAN: "Empréstimo",
    FINANCING: "Financiamento",
    CREDIT_CARD: "Cartão de Crédito",
  };
  return labels[type as keyof typeof labels] || type;
};

const getTypeVariant = (type: string) => {
  const variants = {
    LOAN: "blue",
    FINANCING: "green",
    CREDIT_CARD: "purple",
  };
  return variants[type as keyof typeof variants] || "gray";
};

const getStatusLabel = (financing: Financing) => {
  if (!financing.isActive) {
    return "Quitado";
  }
  if (financing.paidInstallments >= financing.totalInstallments) {
    return "Quitado";
  }
  return "Ativo";
};

const getStatusVariant = (financing: Financing) => {
  if (
    !financing.isActive ||
    financing.paidInstallments >= financing.totalInstallments
  ) {
    return "green";
  }
  return "blue";
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
    await financingStore.fetchFinancings();
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
    await financingStore.deleteFinancing(financing._id!);
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
    await financingStore.payInstallment(
      financing._id!,
      financing.paidInstallments + 1,
      financing.installmentAmount
    );
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
