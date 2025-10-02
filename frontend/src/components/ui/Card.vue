<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  title?: string;
  subtitle?: string;
  animate?: boolean;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  padding: "md",
  rounded: "2xl",
  shadow: "lg",
  hover: true,
  animate: false,
  delay: 0,
});

const cardClasses = computed(() => {
  const baseClasses = [
    "bg-white border transition-all duration-300",
    props.animate ? "animate-slide-up" : "",
  ];

  // Variant classes
  const variantClasses = {
    default: "border-slate-100",
    elevated: "border-slate-200 shadow-lg-custom",
    outlined: "border-slate-300",
    glass: "bg-white/80 backdrop-blur-md border-white/20",
  };

  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };

  // Shadow classes
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  // Hover classes
  const hoverClasses = props.hover ? "hover:shadow-xl hover:scale-[1.02]" : "";

  // Animation delay
  const delayClass = props.delay > 0 ? `delay-${props.delay * 100}` : "";

  return [
    ...baseClasses,
    variantClasses[props.variant],
    paddingClasses[props.padding],
    roundedClasses[props.rounded],
    shadowClasses[props.shadow],
    hoverClasses,
    delayClass,
  ].join(" ");
});
</script>

<style scoped>
.card-header {
  @apply border-b border-slate-100 pb-4 mb-6;
}

.card-title {
  @apply text-xl font-semibold text-slate-900;
}

.card-subtitle {
  @apply text-sm text-slate-500 mt-1;
}

.card-body {
  @apply flex-1;
}

.card-footer {
  @apply border-t border-slate-100 pt-4 mt-6;
}
</style>
