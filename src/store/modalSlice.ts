import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  type: 'success' | 'error' | 'loading' | 'info' | 'confirm' | null;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const initialState: ModalState = {
  isOpen: false,
  type: null,
  message: '',
  onConfirm: undefined,
  onCancel: undefined,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<{ type: 'success' | 'error' | 'loading' | 'info' | 'confirm'; message: string; onConfirm?: () => void; onCancel?: () => void }>) => {
      state.isOpen = true;
      state.type = action.payload.type;
      state.message = action.payload.message;
      state.onConfirm = action.payload.onConfirm;
      state.onCancel = action.payload.onCancel;
    },
    hideModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.message = '';
      state.onConfirm = undefined;
      state.onCancel = undefined;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;
