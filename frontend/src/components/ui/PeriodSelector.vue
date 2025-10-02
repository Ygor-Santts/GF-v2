<template>
  <div class="flex items-center space-x-3">
    <div class="flex items-center space-x-2">
      <Calendar class="w-4 h-4 text-slate-500" />
      <span class="text-sm font-medium text-slate-700">Período:</span>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Mês -->
      <Select
        v-model="selectedMonth"
        :options="monthOptions"
        size="sm"
        class="w-32"
        @change="handlePeriodChange"
      />

      <!-- Ano -->
      <Select
        v-model="selectedYear"
        :options="yearOptions"
        size="sm"
        class="w-20"
        @change="handlePeriodChange"
      />
    </div>

    <!-- Botão para voltar ao mês atual -->
    <Button
      v-if="!isCurrentMonth"
      variant="ghost"
      size="sm"
      :icon="RotateCcw"
      @click="resetToCurrentMonth"
      class="text-slate-500 hover:text-slate-700"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Calendar, RotateCcw } from "lucide-vue-next";
import { Select, Button } from "./index";

interface Props {
  modelValue?: { month: number; year: number };
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: { month: number; year: number }];
  change: [value: { month: number; year: number }];
}>();

// Estado interno
const selectedMonth = ref(props.modelValue?.month || new Date().getMonth() + 1);
const selectedYear = ref(props.modelValue?.year || new Date().getFullYear());

// Opções de mês
const monthOptions = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

// Opções de ano (últimos 5 anos + próximos 2 anos)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push({ value: i, label: i.toString() });
  }

  return years.reverse();
});

// Verificar se é o mês atual
const isCurrentMonth = computed(() => {
  const now = new Date();
  return (
    selectedMonth.value === now.getMonth() + 1 &&
    selectedYear.value === now.getFullYear()
  );
});

// Emitir mudanças
const handlePeriodChange = () => {
  const period = {
    month: selectedMonth.value,
    year: selectedYear.value,
  };

  emit("update:modelValue", period);
  emit("change", period);
};

// Resetar para o mês atual
const resetToCurrentMonth = () => {
  const now = new Date();
  selectedMonth.value = now.getMonth() + 1;
  selectedYear.value = now.getFullYear();
  handlePeriodChange();
};

// Watch para mudanças externas
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedMonth.value = newValue.month;
      selectedYear.value = newValue.year;
    }
  },
  { deep: true }
);

// Inicializar com o mês atual se não houver valor
onMounted(() => {
  if (!props.modelValue) {
    const now = new Date();
    selectedMonth.value = now.getMonth() + 1;
    selectedYear.value = now.getFullYear();
    handlePeriodChange();
  }
});
</script>
