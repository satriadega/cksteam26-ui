import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './postsSlice';
import modalReducer from './modalSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    modal: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
