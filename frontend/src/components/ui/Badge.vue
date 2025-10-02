<template>
  <span :class="badgeClasses">
    <component v-if="icon" :is="icon" :class="iconClasses" />
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";

interface Props {
  variant?: "default" | "success" | "danger" | "warning" | "info" | "primary";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: Component;
  text?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "sm",
  rounded: "full",
});

const badgeClasses = computed(() => {
  const baseClasses = [
    "inline-flex items-center font-medium transition-colors duration-200",
  ];

  // Size classes
  const sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-sm",
  };

  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-blue-100 text-blue-800",
  };

  return [
    ...baseClasses,
    sizeClasses[props.size],
    roundedClasses[props.rounded],
    variantClasses[props.variant],
  ].join(" ");
});

const iconClasses = computed(() => {
  const sizeMap = {
    xs: "w-3 h-3 mr-1",
    sm: "w-3 h-3 mr-1",
    md: "w-4 h-4 mr-1.5",
    lg: "w-4 h-4 mr-2",
  };

  return sizeMap[props.size];
});
</script>
