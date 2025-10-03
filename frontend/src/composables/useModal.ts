import { useModalStore } from "../stores/modalStore";
import { storeToRefs } from "pinia";

export const useModal = () => {
  const modalStore = useModalStore();

  // Use storeToRefs to make the store reactive
  const { isModalOpen, modalType, modalData } = storeToRefs(modalStore);

  const openModal = (type: string, data?: any) => {
    modalStore.openModal(type, data);
  };

  const closeModal = () => {
    modalStore.closeModal();
  };

  const setModalData = (data: any) => {
    modalStore.setModalData(data);
  };

  return {
    isModalOpen,
    modalType,
    modalData,
    openModal,
    closeModal,
    setModalData,
  };
};
