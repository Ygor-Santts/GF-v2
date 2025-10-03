import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore("modal", () => {
  // State
  const isModalOpen = ref(false);
  const modalType = ref<string | null>(null);
  const modalData = ref<any>(null);

  // Actions
  const openModal = (type: string, data?: any) => {
    isModalOpen.value = true;
    modalType.value = type;
    modalData.value = data;
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    isModalOpen.value = false;
    modalType.value = null;
    modalData.value = null;
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  const setModalData = (data: any) => {
    modalData.value = data;
  };

  return {
    // State
    isModalOpen,
    modalType,
    modalData,
    // Actions
    openModal,
    closeModal,
    setModalData,
  };
});
