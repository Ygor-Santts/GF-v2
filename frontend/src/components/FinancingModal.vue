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
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-bounce-in"
      >
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <FileText class="h-6 w-6 text-primary-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {{
                    isEditing ? "Editar Financiamento" : "Novo Financiamento"
                  }}
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Description -->
                  <div>
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Descrição</label
                    >
                    <input
                      id="description"
                      v-model="form.description"
                      type="text"
                      required
                      placeholder="Ex: Financiamento do carro, Casa própria"
                      class="input"
                    />
                  </div>

                  <!-- Type -->
                  <div>
                    <label
                      for="type"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Tipo</label
                    >
                    <select
                      id="type"
                      v-model="form.type"
                      required
                      class="select"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="Imóvel">Financiamento Imobiliário</option>
                      <option value="Veículo">Financiamento de Veículo</option>
                      <option value="Pessoal">Empréstimo Pessoal</option>
                      <option value="Cartão">Parcelamento Cartão</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <!-- Original Amount -->
                  <div>
                    <label
                      for="originalAmount"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Valor Original</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >R$</span
                      >
                      <input
                        id="originalAmount"
                        v-model.number="form.originalAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0,00"
                        class="input pl-10"
                      />
                    </div>
                  </div>

                  <!-- Outstanding Balance -->
                  <div>
                    <label
                      for="outstandingBalance"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Saldo Devedor Atual</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >R$</span
                      >
                      <input
                        id="outstandingBalance"
                        v-model.number="form.outstandingBalance"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0,00"
                        class="input pl-10"
                      />
                    </div>
                  </div>

                  <!-- Installment Amount -->
                  <div>
                    <label
                      for="installmentAmount"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Valor da Parcela</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >R$</span
                      >
                      <input
                        id="installmentAmount"
                        v-model.number="form.installmentAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0,00"
                        class="input pl-10"
                      />
                    </div>
                  </div>

                  <!-- Installments -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="totalInstallments"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Total de Parcelas</label
                      >
                      <input
                        id="totalInstallments"
                        v-model.number="form.totalInstallments"
                        type="number"
                        min="1"
                        required
                        placeholder="Ex: 60"
                        class="input"
                      />
                    </div>
                    <div>
                      <label
                        for="paidInstallments"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Parcelas Pagas</label
                      >
                      <input
                        id="paidInstallments"
                        v-model.number="form.paidInstallments"
                        type="number"
                        min="0"
                        :max="form.totalInstallments"
                        required
                        placeholder="Ex: 12"
                        class="input"
                      />
                    </div>
                  </div>

                  <!-- Interest Rate -->
                  <div>
                    <label
                      for="interestRate"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Taxa de Juros (% a.m.)</label
                    >
                    <div class="relative">
                      <input
                        id="interestRate"
                        v-model.number="form.interestRate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 1.5"
                        class="input pr-8"
                      />
                      <span
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >%</span
                      >
                    </div>
                  </div>

                  <!-- Start Date -->
                  <div>
                    <label
                      for="startDate"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Data de Início</label
                    >
                    <input
                      id="startDate"
                      v-model="form.startDate"
                      type="date"
                      required
                      class="input"
                    />
                  </div>

                  <!-- Status -->
                  <div>
                    <label
                      for="status"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Status</label
                    >
                    <select
                      id="status"
                      v-model="form.status"
                      required
                      class="select"
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="COMPLETED">Quitado</option>
                      <option value="SUSPENDED">Suspenso</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
              {{ isEditing ? "Atualizar" : "Salvar" }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useFinancingStore } from "../stores/financingStore";
import { FileText } from "lucide-vue-next";

// Props
interface Financing {
  _id?: string;
  description: string;
  type: "LOAN" | "FINANCING" | "CREDIT_CARD";
  originalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
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
  save: [];
}>();

// Store
const financingStore = useFinancingStore();

// Reactive data
const loading = ref(false);
const form = ref<Financing>({
  description: "",
  type: "FINANCING",
  originalAmount: 0,
  outstandingBalance: 0,
  installmentAmount: 0,
  totalInstallments: 1,
  paidInstallments: 0,
  interestRate: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .slice(0, 10),
  isActive: true,
});

// Computed
const isEditing = computed(() => !!props.financing?._id);

// Methods
const resetForm = () => {
  form.value = {
    description: "",
    type: "FINANCING",
    originalAmount: 0,
    outstandingBalance: 0,
    installmentAmount: 0,
    totalInstallments: 1,
    paidInstallments: 0,
    interestRate: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .slice(0, 10),
    isActive: true,
  };
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    // Use store instead of direct API call
    if (isEditing.value) {
      await financingStore.updateFinancing(props.financing!._id!, form.value);
    } else {
      await financingStore.createFinancing(form.value);
    }

    emit("save");
  } catch (error) {
    console.error("Error saving financing:", error);
    // TODO: Show error message to user
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  () => props.show,
  (show) => {
    if (show) {
      if (props.financing) {
        // Editing existing financing
        form.value = {
          ...props.financing,
          startDate: props.financing.startDate.slice(0, 10),
        };
      } else {
        // Adding new financing
        resetForm();
      }
    }
  }
);

// Auto-calculate outstanding balance when original amount changes
watch(
  () => form.value.originalAmount,
  (newAmount) => {
    if (!isEditing.value && newAmount > 0) {
      form.value.outstandingBalance = newAmount;
    }
  }
);
</script>

<script lang="ts">
export default {
  name: "FinancingModal",
};
</script>
