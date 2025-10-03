<template>
  <Modal
    :show="show"
    :title="
      isEditing ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente'
    "
    subtitle="Configure uma transação que se repete automaticamente"
    :icon="RotateCcw"
    icon-variant="purple"
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
          required
          placeholder="Ex: Salário, Aluguel, Supermercado"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
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
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
        >
          <option value="">Selecione uma categoria</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Amount and Day -->
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
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
            />
          </div>
        </div>
        <div>
          <label
            for="dayOfMonth"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Dia do Mês
          </label>
          <select
            id="dayOfMonth"
            v-model.number="form.dayOfMonth"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
          >
            <option value="">Selecione o dia</option>
            <option v-for="day in 31" :key="day" :value="day">
              Dia {{ day }}
            </option>
          </select>
        </div>
      </div>

      <!-- Account and Start Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
          />
        </div>
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
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
          />
        </div>
      </div>

      <!-- Status -->
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
          class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
        >
          <option :value="true">Ativo</option>
          <option :value="false">Inativo</option>
        </select>
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
import { useRecurringStore } from "../stores/recurringStore";
import { RotateCcw, ArrowUp, ArrowDown } from "lucide-vue-next";
import { Modal, Button } from "../components/ui";

// Props
interface RecurringTransaction {
  _id?: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  dayOfMonth: number;
  account?: string;
  startDate?: string;
  isActive: boolean;
}

interface Props {
  show: boolean;
  recurring?: RecurringTransaction | null;
  categories: string[];
}

const props = withDefaults(defineProps<Props>(), {
  recurring: null,
});

// Emits
const emit = defineEmits<{
  close: [];
  save: [];
}>();

// Store
const recurringStore = useRecurringStore();

// Reactive data
const loading = ref(false);
const form = ref<RecurringTransaction>({
  description: "",
  type: "EXPENSE",
  category: "",
  amount: 0,
  dayOfMonth: 1,
  account: "",
  startDate: new Date().toISOString().slice(0, 10),
  isActive: true,
});

// Computed
const isEditing = computed(() => !!props.recurring?._id);

// Methods
const resetForm = () => {
  form.value = {
    description: "",
    type: "EXPENSE",
    category: "",
    amount: 0,
    dayOfMonth: 1,
    account: "",
    startDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  };
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    emit("save");
  } catch (error) {
    console.error("Error saving recurring transaction:", error);
    alert("Erro ao salvar transação recorrente");
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  () => props.show,
  (show) => {
    if (show) {
      if (props.recurring) {
        // Editing existing recurring transaction
        form.value = {
          ...props.recurring,
          startDate:
            props.recurring.startDate?.slice(0, 10) ||
            new Date().toISOString().slice(0, 10),
        };
      } else {
        // Adding new recurring transaction
        resetForm();
      }
    }
  }
);
</script>
