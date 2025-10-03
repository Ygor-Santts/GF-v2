<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <!-- Background overlay -->
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="show"
              class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
              @click="handleBackdropClick"
            />
          </Transition>

          <!-- Modal panel -->
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="show"
              class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl ring-1 ring-black ring-opacity-5 transition-all w-full max-h-[90vh] flex flex-col"
              :class="sizeClasses"
            >
              <div class="p-6">
                <!-- Header -->
                <div
                  v-if="title || $slots.header"
                  class="bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100 flex-shrink-0"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div
                        v-if="icon"
                        class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl shadow-sm"
                        :class="iconBgClass"
                      >
                        <component
                          :is="icon"
                          class="h-6 w-6"
                          :class="iconClass"
                        />
                      </div>
                      <div>
                        <h3
                          v-if="title"
                          class="text-xl font-semibold leading-7 text-gray-900"
                          id="modal-title"
                        >
                          {{ title }}
                        </h3>
                        <p v-if="subtitle" class="text-sm text-gray-600 mt-1">
                          {{ subtitle }}
                        </p>
                      </div>
                    </div>
                    <button
                      v-if="closable"
                      @click="$emit('close')"
                      class="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      <span class="sr-only">Fechar</span>
                      <X class="h-5 w-5" />
                    </button>
                  </div>
                  <div v-if="$slots.header" class="mt-4">
                    <slot name="header" />
                  </div>
                </div>

                <!-- Body -->
                <div
                  class="bg-white px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto flex-1"
                >
                  <slot />
                </div>

                <!-- Footer -->
                <div
                  v-if="$slots.footer"
                  class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 sm:py-5 border-t border-gray-100 flex-shrink-0"
                >
                  <slot name="footer" />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { X } from "lucide-vue-next";

interface Props {
  show: boolean;
  title?: string;
  subtitle?: string;
  icon?: any;
  iconVariant?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  closable?: boolean;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconVariant: "blue",
  size: "lg",
  closable: true,
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  close: [];
}>();

const sizeClasses = computed(() => {
  const sizes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl",
  };
  return sizes[props.size];
});

const iconBgClass = computed(() => {
  const variants = {
    blue: "bg-blue-50 border border-blue-200",
    green: "bg-green-50 border border-green-200",
    red: "bg-red-50 border border-red-200",
    yellow: "bg-yellow-50 border border-yellow-200",
    purple: "bg-purple-50 border border-purple-200",
    gray: "bg-gray-50 border border-gray-200",
  };
  return variants[props.iconVariant];
});

const iconClass = computed(() => {
  const variants = {
    blue: "text-blue-700",
    green: "text-green-700",
    red: "text-red-700",
    yellow: "text-yellow-700",
    purple: "text-purple-700",
    gray: "text-gray-700",
  };
  return variants[props.iconVariant];
});

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit("close");
  }
};
</script>
