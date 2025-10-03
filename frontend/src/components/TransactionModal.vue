<template>
  <Modal
    :show="show"
    :title="isEditing ? 'Editar Transação' : 'Nova Transação'"
    subtitle="Registre uma nova transação financeira"
    :icon="CreditCard"
    :icon-variant="form.type === 'INCOME' ? 'green' : 'red'"
    size="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3"
          >Tipo de Transação</label
        >
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="form.type = 'INCOME'"
            class="flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 font-medium"
            :class="
              form.type === 'INCOME'
                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
            "
          >
            <ArrowUp class="w-5 h-5 mr-2" />
            Receita
          </button>
          <button
            type="button"
            @click="form.type = 'EXPENSE'"
            class="flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 font-medium"
            :class="
              form.type === 'EXPENSE'
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
            "
          >
            <ArrowDown class="w-5 h-5 mr-2" />
            Despesa
          </button>
        </div>
      </div>

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
          placeholder="Ex: Salário, Aluguel, Supermercado"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <!-- Category -->
      <div>
        <label
          for="category"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Categoria
        </label>
        <select
          id="category"
          v-model="form.category"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          <option value="">Selecione uma categoria</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Amount and Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="amount"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Valor
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              R$
            </span>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>
        <div>
          <label
            for="date"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Data
          </label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      <!-- Account -->
      <div>
        <label
          for="account"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Conta
        </label>
        <input
          id="account"
          v-model="form.account"
          type="text"
          placeholder="Ex: Conta Corrente, Poupança"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <!-- Status and Fixed -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="status"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            v-model="form.status"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="PAID">Pago</option>
            <option value="PLANNED">Planejado</option>
          </select>
        </div>
        <div class="flex items-center">
          <input
            id="isFixed"
            v-model="form.isFixed"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="isFixed" class="ml-2 block text-sm text-gray-700">
            Transação fixa
          </label>
        </div>
      </div>
    </form>

    <template #footer>
      <div
        class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 justify-between p-3"
      >
        <Button
          size="sm"
          type="button"
          variant="secondary"
          @click="$emit('close')"
          class="mt-3 sm:mt-0"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
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
import { useTransactionStore } from "../stores/transactionStore";
import { CreditCard, ArrowUp, ArrowDown } from "lucide-vue-next";
import { Modal, Button } from "../components/ui";

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
  amount: 0,
  account: "",
  isFixed: false,
  status: "PAID",
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
    amount: 0,
    account: "",
    isFixed: false,
    status: "PAID",
  };
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    if (isEditing.value) {
      await transactionStore.updateTransaction(
        props.transaction!._id!,
        form.value
      );
    } else {
      // Ensure status is always set (required by Transaction type)
      await transactionStore.createTransaction({
        ...form.value,
        status: form.value.status ?? "PLANNED", // fallback to a default if undefined
      });
    }

    emit("save");
  } catch (error) {
    console.error("Error saving transaction:", error);
    alert("Erro ao salvar transação");
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
          date: props.transaction.date.slice(0, 10),
        };
      } else {
        // Adding new transaction
        resetForm();
      }
    }
  }
);
</script>
