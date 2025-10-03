<template>
  <Modal
    :show="show"
    :title="financing?.description"
    :subtitle="financing ? getTypeLabel(financing.type) : ''"
    :icon="FileText"
    icon-variant="blue"
    size="4xl"
    @close="$emit('close')"
  >
    <div v-if="financing" class="space-y-6">
      <!-- Status and Progress -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <Badge :variant="getStatusVariant(financing)">
            {{ getStatusLabel(financing) }}
          </Badge>
          <span class="text-sm text-gray-500">
            {{ financing.paidInstallments }}/{{
              financing.totalInstallments
            }}
            parcelas
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-blue-600 h-3 rounded-full transition-all duration-500"
            :style="{ width: getProgressPercentage() + '%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          {{ getProgressPercentage().toFixed(1) }}% concluído
        </p>
      </div>

      <!-- Financial Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Valor Original</p>
          <p class="text-lg font-semibold text-gray-900">
            {{ formatCurrency(financing.originalAmount) }}
          </p>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <p class="text-xs text-red-600 mb-1">Saldo Devedor</p>
          <p class="text-lg font-semibold text-red-600">
            {{ formatCurrency(financing.outstandingBalance) }}
          </p>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <p class="text-xs text-yellow-600 mb-1">Parcela Mensal</p>
          <p class="text-lg font-semibold text-yellow-600">
            {{ formatCurrency(financing.installmentAmount) }}
          </p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <p class="text-xs text-green-600 mb-1">Valor Pago</p>
          <p class="text-lg font-semibold text-green-600">
            {{ formatCurrency(getTotalPaid()) }}
          </p>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Financial Details -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">
            Detalhes Financeiros
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Taxa de Juros</span>
              <span class="text-sm font-medium text-gray-900"
                >{{ financing.interestRate }}% a.m.</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Parcelas Restantes</span>
              <span class="text-sm font-medium text-gray-900">
                {{ financing.totalInstallments - financing.paidInstallments }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Total de Juros</span>
              <span class="text-sm font-medium text-gray-900">
                {{ formatCurrency(getTotalInterest()) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Valor Total</span>
              <span class="text-sm font-medium text-gray-900">
                {{
                  formatCurrency(
                    financing.totalInstallments * financing.installmentAmount
                  )
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Date Details -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Datas</h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Data de Início</span>
              <span class="text-sm font-medium text-gray-900">
                {{ formatDate(financing.startDate) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Previsão de Quitação</span>
              <span class="text-sm font-medium text-gray-900">
                {{ formatDate(financing.endDate) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Tempo Restante</span>
              <span class="text-sm font-medium text-gray-900">
                {{ getRemainingTime() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Simulation -->
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          Simulação de Pagamento Antecipado
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Valor Extra
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
              >
                R$
              </span>
              <input
                v-model.number="extraPayment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div class="flex items-end">
            <Button
              @click="calculateEarlyPayment"
              variant="primary"
              size="sm"
              class="w-full"
            >
              Calcular
            </Button>
          </div>
          <div v-if="earlyPaymentResult" class="flex items-center">
            <div>
              <p class="text-xs text-gray-500">Economia de Juros</p>
              <p class="text-sm font-semibold text-green-600">
                {{ formatCurrency(earlyPaymentResult.savings) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3"
      >
        <Button
          type="button"
          variant="secondary"
          @click="$emit('close')"
          class="mt-3 sm:mt-0"
        >
          Fechar
        </Button>
        <Button
          v-if="
            financing?.isActive &&
            financing.paidInstallments < financing.totalInstallments
          "
          @click="payInstallment"
          variant="success"
          :icon="CreditCard"
          class="w-full sm:w-auto"
        >
          Pagar Parcela
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FileText, CreditCard } from "lucide-vue-next";
import { Modal, Button, Badge } from "../components/ui";
import type { Financing } from "../services/financingService";

// Props
interface Props {
  show: boolean;
  financing?: Financing | null;
}

const props = withDefaults(defineProps<Props>(), {
  financing: null,
});

// Emits
const emit = defineEmits<{
  close: [];
}>();

// Reactive data
const extraPayment = ref(0);
const earlyPaymentResult = ref<{ savings: number } | null>(null);

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

const getProgressPercentage = () => {
  if (!props.financing) return 0;
  return (
    (props.financing.paidInstallments / props.financing.totalInstallments) * 100
  );
};

const getTotalPaid = () => {
  if (!props.financing) return 0;
  return props.financing.paidInstallments * props.financing.installmentAmount;
};

const getTotalInterest = () => {
  if (!props.financing) return 0;
  const totalPaid =
    props.financing.totalInstallments * props.financing.installmentAmount;
  return totalPaid - props.financing.originalAmount;
};

const getRemainingTime = () => {
  if (!props.financing) return "";
  const remaining =
    props.financing.totalInstallments - props.financing.paidInstallments;
  return `${remaining} parcelas`;
};

const calculateEarlyPayment = () => {
  if (!props.financing || !extraPayment.value) return;

  // Simple calculation - in a real app, this would be more complex
  const remainingBalance = props.financing.outstandingBalance;
  const monthlyRate = props.financing.interestRate / 100;
  const remainingMonths =
    props.financing.totalInstallments - props.financing.paidInstallments;

  // Calculate savings (simplified)
  const interestSavings =
    extraPayment.value * monthlyRate * (remainingMonths / 2);

  earlyPaymentResult.value = {
    savings: Math.max(0, interestSavings),
  };
};

const payInstallment = () => {
  // This would trigger the parent component to handle the payment
  console.log("Pay installment for financing:", props.financing?._id);
  emit("close");
};
</script>
