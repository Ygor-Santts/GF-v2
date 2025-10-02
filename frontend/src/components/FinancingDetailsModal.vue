<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-bounce-in"
      >
        <div v-if="financing" class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ financing.description }}
              </h3>
              <p class="text-sm text-gray-500">{{ financing.type }}</p>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Status and Progress -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
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
              <span class="text-sm text-gray-500"
                >{{ financing.paidInstallments }}/{{
                  financing.totalInstallments
                }}
                parcelas</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-primary-600 h-3 rounded-full transition-all duration-500"
                :style="{ width: getProgressPercentage() + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ getProgressPercentage().toFixed(1) }}% concluído
            </p>
          </div>

          <!-- Financial Summary -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-500">Valor Original</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(financing.originalAmount) }}
              </p>
            </div>
            <div class="text-center p-3 bg-danger-50 rounded-lg">
              <p class="text-xs text-danger-600">Saldo Devedor</p>
              <p class="text-lg font-semibold text-danger-600">
                {{ formatCurrency(financing.outstandingBalance) }}
              </p>
            </div>
            <div class="text-center p-3 bg-yellow-50 rounded-lg">
              <p class="text-xs text-yellow-600">Parcela Mensal</p>
              <p class="text-lg font-semibold text-yellow-600">
                {{ formatCurrency(financing.installmentAmount) }}
              </p>
            </div>
            <div class="text-center p-3 bg-success-50 rounded-lg">
              <p class="text-xs text-success-600">Valor Pago</p>
              <p class="text-lg font-semibold text-success-600">
                {{
                  formatCurrency(
                    financing.paidInstallments * financing.installmentAmount
                  )
                }}
              </p>
            </div>
          </div>

          <!-- Details Table -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">
              Detalhes do Financiamento
            </h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Taxa de Juros
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ financing.interestRate }}% a.m.
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Data de Início
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ formatDate(financing.startDate) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Parcelas Restantes
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{
                      financing.totalInstallments - financing.paidInstallments
                    }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Previsão de Quitação
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ getEstimatedEndDate() }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Total de Juros
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ formatCurrency(getTotalInterest()) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">
                    Valor Total do Financiamento
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{
                      formatCurrency(
                        financing.totalInstallments *
                          financing.installmentAmount
                      )
                    }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Payment Simulation -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">
              Simulação de Pagamento Antecipado
            </h4>
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1"
                    >Valor Extra</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                      >R$</span
                    >
                    <input
                      v-model.number="extraPayment"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      class="input pl-10 text-sm"
                    />
                  </div>
                </div>
                <div class="flex items-end">
                  <button
                    @click="calculateEarlyPayment"
                    class="btn-primary text-sm w-full"
                  >
                    Calcular
                  </button>
                </div>
                <div v-if="earlyPaymentResult" class="flex items-center">
                  <div>
                    <p class="text-xs text-gray-500">Economia de Juros</p>
                    <p class="text-sm font-semibold text-success-600">
                      {{ formatCurrency(earlyPaymentResult.savings) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button @click="$emit('close')" class="btn-secondary">
              Fechar
            </button>
            <button
              v-if="financing.status === 'ACTIVE'"
              @click="payInstallment"
              class="btn-success"
            >
              <CreditCardIcon class="w-4 h-4 mr-2" />
              Pagar Parcela
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { XMarkIcon, CreditCardIcon } from "@heroicons/vue/24/outline";

// Props
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

const getStatusLabel = (status: string) => {
  const labels = {
    ACTIVE: "Ativo",
    COMPLETED: "Quitado",
    SUSPENDED: "Suspenso",
  };
  return labels[status as keyof typeof labels] || status;
};

const getProgressPercentage = () => {
  if (!props.financing) return 0;
  return (
    (props.financing.paidInstallments / props.financing.totalInstallments) * 100
  );
};

const getEstimatedEndDate = () => {
  if (!props.financing) return "";

  const startDate = new Date(props.financing.startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + props.financing.totalInstallments);

  return endDate.toLocaleDateString("pt-BR");
};

const getTotalInterest = () => {
  if (!props.financing) return 0;

  const totalPaid =
    props.financing.totalInstallments * props.financing.installmentAmount;
  return totalPaid - props.financing.originalAmount;
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
