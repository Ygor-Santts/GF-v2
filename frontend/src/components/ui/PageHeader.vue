<template>
  <div :class="headerClasses">
    <div class="absolute inset-0 opacity-10">
      <component :is="backgroundIcon" class="w-full h-full" />
    </div>
    <div
      class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center"
    >
      <div>
        <h1 class="text-3xl font-bold mb-1">{{ title }}</h1>
        <p class="text-blue-100 text-lg">
          {{ subtitle }}
        </p>
      </div>
      <div
        v-if="$slots.actions"
        class="mt-4 sm:mt-0 flex items-center space-x-3"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";

interface Props {
  title: string;
  subtitle: string;
  backgroundIcon: Component;
  variant?: "blue" | "emerald" | "purple" | "red" | "amber";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "blue",
});

const headerClasses = computed(() => {
  const baseClasses = [
    "relative p-6 rounded-2xl shadow-lg-custom overflow-hidden text-white",
  ];

  const variantClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
    red: "bg-gradient-to-br from-red-500 to-red-600",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
  };

  return [...baseClasses, variantClasses[props.variant]].join(" ");
});
</script>
