<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative">
      <div
        v-if="icon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component :is="icon" :class="iconClasses" />
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="help" class="text-sm text-slate-500">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Component } from "vue";

interface Props {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  label?: string;
  placeholder?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  icon?: Component;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "error";
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  size: "md",
  variant: "default",
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const inputClasses = computed(() => {
  const baseClasses = [
    "block w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
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

  // Icon padding
  const iconPadding = props.icon ? "pl-10" : "";

  // Disabled classes
  const disabledClasses = props.disabled
    ? "bg-slate-50 text-slate-500 cursor-not-allowed"
    : "bg-white text-slate-900";

  // Readonly classes
  const readonlyClasses = props.readonly ? "bg-slate-50 text-slate-600" : "";

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    iconPadding,
    disabledClasses,
    readonlyClasses,
  ].join(" ");
});

const iconClasses = computed(() => {
  const sizeMap = {
    sm: "w-4 h-4 text-slate-400",
    md: "w-5 h-5 text-slate-400",
    lg: "w-5 h-5 text-slate-400",
  };

  return sizeMap[props.size];
});
</script>
