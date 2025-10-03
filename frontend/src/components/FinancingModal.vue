<template>
  <Modal
    :show="show"
    :title="isEditing ? 'Editar Financiamento' : 'Novo Financiamento'"
    subtitle="Gerencie as informações do seu financiamento"
    :icon="FileText"
    icon-variant="blue"
    size="2xl"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Description -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Descrição
        </label>
        <input
          id="description"
          v-model="form.description"
          type="text"
          required
          placeholder="Ex: Financiamento do carro, Casa própria"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <!-- Type -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
          Tipo
        </label>
        <select
          id="type"
          v-model="form.type"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          <option value="">Selecione o tipo</option>
          <option value="LOAN">Empréstimo Pessoal</option>
          <option value="FINANCING">Financiamento</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
        </select>
      </div>

      <!-- Financial Values -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Original Amount -->
        <div>
          <label
            for="originalAmount"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Valor Original
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              R$
            </span>
            <input
              id="originalAmount"
              v-model.number="form.originalAmount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        <!-- Outstanding Balance -->
        <div>
          <label
            for="outstandingBalance"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Saldo Devedor Atual
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              R$
            </span>
            <input
              id="outstandingBalance"
              v-model.number="form.outstandingBalance"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        <!-- Installment Amount -->
        <div>
          <label
            for="installmentAmount"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Valor da Parcela
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              R$
            </span>
            <input
              id="installmentAmount"
              v-model.number="form.installmentAmount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      <!-- Installments -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="totalInstallments"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Total de Parcelas
          </label>
          <input
            id="totalInstallments"
            v-model.number="form.totalInstallments"
            type="number"
            min="1"
            required
            placeholder="Ex: 60"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        <div>
          <label
            for="paidInstallments"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Parcelas Pagas
          </label>
          <input
            id="paidInstallments"
            v-model.number="form.paidInstallments"
            type="number"
            min="0"
            :max="form.totalInstallments"
            required
            placeholder="Ex: 12"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      <!-- Interest Rate and Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="interestRate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Taxa de Juros (% a.m.)
          </label>
          <div class="relative">
            <input
              id="interestRate"
              v-model.number="form.interestRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 1.5"
              class="w-full pr-8 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <span
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              %
            </span>
          </div>
        </div>
        <div>
          <label
            for="isActive"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="isActive"
            v-model="form.isActive"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option :value="true">Ativo</option>
            <option :value="false">Quitado</option>
          </select>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="startDate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Data de Início
          </label>
          <input
            id="startDate"
            v-model="form.startDate"
            type="date"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        <div>
          <label
            for="endDate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Data de Fim
          </label>
          <input
            id="endDate"
            v-model="form.endDate"
            type="date"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>
    </form>

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
          Cancelar
        </Button>
        <Button
          type="submit"
          :loading="loading"
          @click="handleSubmit"
          class="w-full sm:w-auto"
        >
          {{ isEditing ? "Atualizar" : "Salvar" }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useFinancingStore } from "../stores/financingStore";
import { FileText } from "lucide-vue-next";
import { Modal, Button } from "../components/ui";
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

    if (isEditing.value) {
      await financingStore.updateFinancing(props.financing!._id!, form.value);
    } else {
      await financingStore.createFinancing(form.value);
    }

    emit("save");
  } catch (error) {
    console.error("Error saving financing:", error);
    alert("Erro ao salvar financiamento");
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
          endDate: props.financing.endDate.slice(0, 10),
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
