<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <ChevronDown class="w-5 h-5 text-slate-400" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="help" class="text-sm text-slate-500">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

interface Option {
  value: any;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: any;
  options: Option[] | string[];
  label?: string;
  placeholder?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "error";
  valueKey?: string;
  labelKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  variant: "default",
  disabled: false,
  required: false,
  valueKey: "value",
  labelKey: "label",
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [value: any];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit("update:modelValue", value);
  emit("change", value);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const getOptionValue = (option: Option | string) => {
  if (typeof option === "string") return option;
  return option[props.valueKey as keyof Option];
};

const getOptionLabel = (option: Option | string) => {
  if (typeof option === "string") return option;
  return option[props.labelKey as keyof Option];
};

const selectClasses = computed(() => {
  const baseClasses = [
    "block w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none",
  ];

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    default: "border-slate-300 focus:border-blue-500 focus:ring-blue-500",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
  };

  // Disabled classes
  const disabledClasses = props.disabled
    ? "bg-slate-50 text-slate-500 cursor-not-allowed"
    : "bg-white text-slate-900";

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses,
  ].join(" ");
});
</script>
