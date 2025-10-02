<template>
  <Card
    :variant="variant"
    :padding="padding"
    :rounded="rounded"
    :shadow="shadow"
    :hover="hover"
    :animate="animate"
    :delay="delay"
  >
    <div class="flex items-center justify-between mb-4">
      <div :class="iconContainerClasses">
        <component :is="icon" :class="iconClasses" />
      </div>
      <div class="text-right">
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p :class="valueClasses">
          {{ formattedValue }}
        </p>
      </div>
    </div>

    <div v-if="trend || subtitle" class="flex items-center text-sm">
      <component v-if="trendIcon" :is="trendIcon" :class="trendIconClasses" />
      <span :class="trendClasses">
        {{ trendText }}
      </span>
      <span v-if="subtitle" class="text-slate-500 ml-1">
        {{ subtitle }}
      </span>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import Card from "./Card.vue";

interface Props {
  // Card props
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  animate?: boolean;
  delay?: number;

  // Metric props
  label: string;
  value: string | number;
  icon: Component;
  iconColor?:
    | "blue"
    | "emerald"
    | "red"
    | "amber"
    | "purple"
    | "cyan"
    | "slate";
  valueColor?: "default" | "success" | "danger" | "warning" | "info";

  // Trend props
  trend?: "up" | "down" | "stable";
  trendText?: string;
  trendIcon?: Component;
  subtitle?: string;

  // Formatting
  format?: "currency" | "number" | "percentage" | "text";
  currency?: string;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  padding: "md",
  rounded: "2xl",
  shadow: "lg",
  hover: true,
  animate: false,
  delay: 0,
  iconColor: "blue",
  valueColor: "default",
  format: "text",
  currency: "BRL",
  locale: "pt-BR",
});

const formattedValue = computed(() => {
  if (props.format === "currency") {
    return new Intl.NumberFormat(props.locale, {
      style: "currency",
      currency: props.currency,
    }).format(Number(props.value));
  }

  if (props.format === "percentage") {
    return `${Number(props.value).toFixed(1)}%`;
  }

  if (props.format === "number") {
    return new Intl.NumberFormat(props.locale).format(Number(props.value));
  }

  return String(props.value);
});

const iconContainerClasses = computed(() => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    cyan: "bg-cyan-100 text-cyan-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return `p-3 rounded-xl ${colorClasses[props.iconColor]}`;
});

const iconClasses = computed(() => {
  return "w-6 h-6";
});

const valueClasses = computed(() => {
  const baseClasses = "text-2xl font-bold text-slate-800";

  const colorClasses = {
    default: "",
    success: "text-emerald-600",
    danger: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };

  return `${baseClasses} ${colorClasses[props.valueColor]}`;
});

const trendIconClasses = computed(() => {
  const colorClasses = {
    up: "text-emerald-500",
    down: "text-red-500",
    stable: "text-slate-500",
  };

  return `w-4 h-4 mr-1 ${colorClasses[props.trend || "stable"]}`;
});

const trendClasses = computed(() => {
  const colorClasses = {
    up: "text-emerald-600 font-medium",
    down: "text-red-600 font-medium",
    stable: "text-slate-600",
  };

  return colorClasses[props.trend || "stable"];
});
</script>
