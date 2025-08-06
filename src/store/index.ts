import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './postsSlice';
import modalReducer from './modalSlice';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    modal: modalReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
