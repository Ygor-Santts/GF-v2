<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <div v-if="loading" class="flex items-center justify-center">
      <div
        class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
      ></div>
      <span>{{ loadingText || "Carregando..." }}</span>
    </div>
    <div v-else class="flex items-center justify-center">
      <component v-if="icon" :is="icon" :class="iconClasses" />
      <span v-if="text" :class="textClasses">
        {{ text }}
      </span>
      <slot v-else />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";

interface Props {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: Component;
  iconPosition?: "left" | "right";
  text?: string;
  fullWidth?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  iconPosition: "left",
  fullWidth: false,
  rounded: "lg",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};

const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    props.fullWidth ? "w-full" : "",
  ];

  // Size classes
  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 border border-slate-200",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-md",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
    warning:
      "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm hover:shadow-md",
    info: "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 shadow-sm hover:shadow-md",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-500",
  };

  // Disabled classes
  const disabledClasses =
    props.disabled || props.loading
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

  return [
    ...baseClasses,
    sizeClasses[props.size],
    roundedClasses[props.rounded],
    variantClasses[props.variant],
    disabledClasses,
  ].join(" ");
});

const iconClasses = computed(() => {
  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const positionMap = {
    left: props.text ? "mr-2" : "",
    right: props.text ? "ml-2" : "",
  };

  return [sizeMap[props.size], positionMap[props.iconPosition]].join(" ");
});

const textClasses = computed(() => {
  return props.icon && props.iconPosition === "left" ? "ml-0" : "";
});
</script>
