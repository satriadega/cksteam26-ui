import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { API_URL } from "../api";

interface Profile {
  username: string;
  name: string;
  email: string;
  statusNotification: boolean;
  hasNotification: boolean;
  notificationCounter: number;
  notificationType: number;
}

interface UserState {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const getProfile = createAsyncThunk("user/getProfile", async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data[0];
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
