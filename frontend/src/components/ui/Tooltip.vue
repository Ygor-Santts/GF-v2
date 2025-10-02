<template>
  <div
    class="relative inline-block"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <slot />

    <!-- Tooltip -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showTooltip" :class="tooltipClasses" role="tooltip">
        <div class="text-sm font-medium text-white whitespace-nowrap">
          {{ text }}
        </div>
        <!-- Arrow -->
        <div :class="arrowClasses"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "dark" | "light";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  position: "top",
  variant: "dark",
  disabled: false,
});

const showTooltip = ref(false);

const tooltipClasses = computed(() => {
  const baseClasses = [
    "absolute z-50 px-3 py-2 rounded-lg shadow-lg transition-opacity duration-200",
  ];

  const variantClasses = {
    dark: "bg-slate-900 text-white",
    light: "bg-white text-slate-900 border border-slate-200",
  };

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return [
    ...baseClasses,
    variantClasses[props.variant],
    positionClasses[props.position],
  ].join(" ");
});

const arrowClasses = computed(() => {
  const baseClasses = "absolute w-2 h-2 transform rotate-45";

  const variantClasses = {
    dark: "bg-slate-900",
    light: "bg-white border border-slate-200",
  };

  const positionClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 -mt-1",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 -mb-1",
    left: "left-full top-1/2 transform -translate-y-1/2 -ml-1",
    right: "right-full top-1/2 transform -translate-y-1/2 -mr-1",
  };

  return [
    baseClasses,
    variantClasses[props.variant],
    positionClasses[props.position],
  ].join(" ");
});
</script>
