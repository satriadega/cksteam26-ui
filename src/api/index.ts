import axios from "axios";
import { isAuthenticated } from "../utils/auth";

const API_URL = "http://localhost:8081";

import type { AxiosRequestConfig } from "axios";

export const getDocuments = (page = 0, searchTerm = "") => {
  const headers: AxiosRequestConfig["headers"] = {};
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const params: { page: number; keyword?: string } = { page };
  if (searchTerm?.trim()) {
    params.keyword = searchTerm.trim();
  }

  return axios.get(`${API_URL}/public/document`, {
    headers,
    params,
    withCredentials: true,
  });
};

export const getDocumentById = (id: number) => {
  const headers: AxiosRequestConfig["headers"] = {};
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return axios.get(`${API_URL}/public/document/${id}`, { headers, withCredentials: true });
};

export const getProfile = () => {
  const headers: AxiosRequestConfig["headers"] = {};
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return axios.get(`${API_URL}/profile`, { headers, withCredentials: true });
};

export const updateProfile = (data: { name: string; password?: string; statusNotification: boolean }) => {
  const headers: AxiosRequestConfig["headers"] = {
    "Content-Type": "application/json"
  };
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return axios.put(`${API_URL}/profile`, data, { headers, withCredentials: true });
};
