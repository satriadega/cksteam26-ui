import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocuments } from '../api';

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async () => {
  const response = await getDocuments();
  return response.data.data.content;
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    status: 'idle',
    error: null as string | null | undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default documentsSlice.reducer;
