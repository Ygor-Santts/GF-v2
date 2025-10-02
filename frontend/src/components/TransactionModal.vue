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
                <CreditCard class="h-6 w-6 text-primary-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {{ isEditing ? "Editar Transação" : "Nova Transação" }}
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Transaction Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Tipo</label
                    >
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        @click="form.type = 'INCOME'"
                        class="flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
                        :class="
                          form.type === 'INCOME'
                            ? 'border-success-500 bg-success-50 text-success-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        "
                      >
                        <ArrowUp class="w-4 h-4 mr-2" />
                        Receita
                      </button>
                      <button
                        type="button"
                        @click="form.type = 'EXPENSE'"
                        class="flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
                        :class="
                          form.type === 'EXPENSE'
                            ? 'border-danger-500 bg-danger-50 text-danger-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        "
                      >
                        <ArrowDown class="w-4 h-4 mr-2" />
                        Gasto
                      </button>
                    </div>
                  </div>

                  <!-- Date -->
                  <div>
                    <label
                      for="date"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Data</label
                    >
                    <input
                      id="date"
                      v-model="form.date"
                      type="date"
                      required
                      class="input"
                    />
                  </div>

                  <!-- Category -->
                  <div>
                    <label
                      for="category"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Categoria</label
                    >
                    <div class="relative">
                      <input
                        id="category"
                        v-model="form.category"
                        type="text"
                        required
                        list="categories"
                        placeholder="Digite ou selecione uma categoria"
                        class="input"
                      />
                      <datalist id="categories">
                        <option
                          v-for="category in categories"
                          :key="category"
                          :value="category"
                        />
                        <option value="Alimentação" />
                        <option value="Transporte" />
                        <option value="Moradia" />
                        <option value="Lazer" />
                        <option value="Saúde" />
                        <option value="Educação" />
                        <option value="Vestuário" />
                        <option value="Investimentos" />
                        <option value="Outros" />
                      </datalist>
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Descrição</label
                    >
                    <textarea
                      id="description"
                      v-model="form.description"
                      rows="2"
                      placeholder="Descrição opcional da transação"
                      class="input resize-none"
                    ></textarea>
                  </div>

                  <!-- Amount -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="plannedAmount"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Valor Planejado</label
                      >
                      <div class="relative">
                        <span
                          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >R$</span
                        >
                        <input
                          id="plannedAmount"
                          v-model.number="form.plannedAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          class="input pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        for="amount"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Valor Real</label
                      >
                      <div class="relative">
                        <span
                          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >R$</span
                        >
                        <input
                          id="amount"
                          v-model.number="form.amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          class="input pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Status and Options -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="status"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Status</label
                      >
                      <select id="status" v-model="form.status" class="select">
                        <option value="PLANNED">Planejado</option>
                        <option value="PAID">Pago</option>
                      </select>
                    </div>
                    <div class="flex items-end">
                      <label class="flex items-center">
                        <input
                          v-model="form.isFixed"
                          type="checkbox"
                          class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-700"
                          >Transação fixa</span
                        >
                      </label>
                    </div>
                  </div>

                  <!-- Account (optional) -->
                  <div>
                    <label
                      for="account"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Conta (opcional)</label
                    >
                    <input
                      id="account"
                      v-model="form.account"
                      type="text"
                      placeholder="Ex: Conta Corrente, Cartão de Crédito"
                      class="input"
                    />
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
import { useTransactionStore } from "../stores/transactionStore";
import { CreditCard, ArrowUp, ArrowDown } from "lucide-vue-next";

// Props
interface Transaction {
  _id?: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  plannedAmount?: number;
  amount?: number;
  account?: string;
  isFixed?: boolean;
  status?: "PLANNED" | "PAID";
}

interface Props {
  show: boolean;
  transaction?: Transaction | null;
  categories: string[];
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
});

// Emits
const emit = defineEmits<{
  close: [];
  save: [];
}>();

// Store
const transactionStore = useTransactionStore();

// Reactive data
const loading = ref(false);
const form = ref<Transaction>({
  date: new Date().toISOString().slice(0, 10),
  type: "EXPENSE",
  category: "",
  description: "",
  plannedAmount: undefined,
  amount: undefined,
  account: "",
  isFixed: false,
  status: "PLANNED",
});

// Computed
const isEditing = computed(() => !!props.transaction?._id);

// Methods
const resetForm = () => {
  form.value = {
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE",
    category: "",
    description: "",
    plannedAmount: undefined,
    amount: undefined,
    account: "",
    isFixed: false,
    status: "PLANNED",
  };
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    // Prepare data
    const data = {
      ...form.value,
      // Convert negative amounts for expenses to positive (backend expects positive values)
      plannedAmount: form.value.plannedAmount
        ? Math.abs(form.value.plannedAmount)
        : undefined,
      amount: form.value.amount ? Math.abs(form.value.amount) : undefined,
    };

    // Use store instead of direct API call
    if (isEditing.value) {
      await transactionStore.updateTransaction(props.transaction!._id!, data);
    } else {
      await transactionStore.createTransaction(data);
    }

    emit("save");
  } catch (error) {
    console.error("Error saving transaction:", error);
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
      if (props.transaction) {
        // Editing existing transaction
        form.value = {
          ...props.transaction,
          date: props.transaction.date.slice(0, 10), // Format date for input
        };
      } else {
        // Adding new transaction
        resetForm();
      }
    }
  }
);

// Auto-fill amount when status changes to PAID
watch(
  () => form.value.status,
  (status) => {
    if (status === "PAID" && form.value.plannedAmount && !form.value.amount) {
      form.value.amount = form.value.plannedAmount;
    }
  }
);
</script>

<script lang="ts">
export default {
  name: "TransactionModal",
};
</script>
