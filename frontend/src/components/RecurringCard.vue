<template>
  <Card
    :variant="'elevated'"
    :padding="'md'"
    :rounded="'xl'"
    :shadow="'md'"
    :hover="true"
    class="group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Header with badges -->
        <div class="flex items-center space-x-2 mb-3">
          <Badge
            :variant="recurring.type === 'INCOME' ? 'success' : 'danger'"
            :icon="recurring.type === 'INCOME' ? TrendingUp : TrendingDown"
            :text="recurring.type === 'INCOME' ? 'Receita' : 'Gasto'"
            size="sm"
          />
          <Badge
            :variant="recurring.isActive ? 'success' : 'default'"
            :text="recurring.isActive ? 'Ativo' : 'Inativo'"
            size="sm"
          />
        </div>

        <!-- Content -->
        <div class="mb-4">
          <h4 class="font-semibold text-slate-900 mb-1 text-lg">
            {{ recurring.description || recurring.category }}
          </h4>
          <p class="text-sm text-slate-500 mb-2">{{ recurring.category }}</p>

          <!-- Amount and day -->
          <div class="flex items-center justify-between">
            <span
              class="text-xl font-bold"
              :class="
                recurring.type === 'INCOME'
                  ? 'text-emerald-600'
                  : 'text-red-600'
              "
            >
              {{ formatCurrency(Math.abs(recurring.amount || 0)) }}
            </span>
            <div class="flex items-center text-sm text-slate-500">
              <Calendar class="w-4 h-4 mr-1" />
              Dia {{ recurring.dayOfMonth || 1 }}
            </div>
          </div>
        </div>

        <!-- Next occurrence -->
        <div class="pt-3 border-t border-slate-100">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">Próxima ocorrência:</span>
            <span class="font-medium text-slate-700">
              {{ getNextOccurrence(recurring) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div
        class="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Button
          variant="ghost"
          size="sm"
          :icon="Edit"
          @click="$emit('edit', recurring)"
          class="p-2"
        />

        <Button
          variant="ghost"
          size="sm"
          :icon="recurring.isActive ? Pause : Play"
          @click="$emit('toggle', recurring)"
          class="p-2"
          :class="
            recurring.isActive
              ? 'hover:text-amber-600'
              : 'hover:text-emerald-600'
          "
        />

        <Button
          variant="ghost"
          size="sm"
          :icon="Trash2"
          @click="$emit('delete', recurring)"
          class="p-2 hover:text-red-600"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card, Button, Badge } from "./ui";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Edit,
  Pause,
  Play,
  Trash2,
} from "lucide-vue-next";

interface RecurringTransaction {
  _id?: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface Props {
  recurring: RecurringTransaction;
}

defineProps<Props>();

defineEmits<{
  edit: [recurring: RecurringTransaction];
  toggle: [recurring: RecurringTransaction];
  delete: [recurring: RecurringTransaction];
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getNextOccurrence = (recurring: RecurringTransaction) => {
  const now = new Date();
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    recurring.dayOfMonth
  );

  // If the day has already passed this month, show next month
  if (now.getDate() > recurring.dayOfMonth) {
    return nextMonth.toLocaleDateString("pt-BR");
  } else {
    const thisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      recurring.dayOfMonth
    );
    return thisMonth.toLocaleDateString("pt-BR");
  }
};
</script>
