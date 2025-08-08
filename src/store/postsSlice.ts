import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDocuments } from '../api';
import { AxiosError } from 'axios';

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await getDocuments();
    return response.data.data.content;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status === 400) {
      return [];
    }
    return rejectWithValue(axiosError.response?.data || axiosError.message);
  }
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
