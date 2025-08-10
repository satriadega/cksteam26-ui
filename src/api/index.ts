import axios from "axios";
import { isAuthenticated, clearAuth } from "../utils/auth";

const API_URL = "http://localhost:8081";

import type { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.data?.error_code === "X01001")) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const getAuthHeaders = (): AxiosRequestConfig["headers"] => {
  const headers: AxiosRequestConfig["headers"] = {};
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export const getDocuments = (
  page = 0,
  searchTerm = "",
  sort = "asc",
  sortBy = "id"
) => {
  const params: { column?: string; value?: string } = {};
  if (searchTerm?.trim()) {
    params.column = "title";
    params.value = searchTerm.trim();
  }

  return api.get(`/document/${sort}/${sortBy}/${page}`, {
    headers: getAuthHeaders(),
    params,
  });
};

export const getDocumentById = (id: number) => {
  return api.get(`/public/document/${id}`, { headers: getAuthHeaders() })
    .then(response => {
      return response.data;
    });
};

export const getProfile = () => {
  return api.get("/profile", { headers: getAuthHeaders() }).then(response => {
    console.log("API - getProfile response data:", response.data);
    return response;
  });
};

export const updateProfile = (data: {
  name: string;
  password?: string;
  statusNotification: boolean;
}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return api.put("/profile", data, { headers });
};

export const createDocument = (data: {
  title: string;
  content: string;
  publicVisibility: boolean;
  referenceDocumentId: number | null;
  version: number;
  subversion: number;
  private: boolean;
}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return api.post("/document", data, { headers }).then((response) => {
    return response.data;
  });
};

export const getRelatedDocuments = (documentId: number) => {
  return api.get(`/public/document/related/${documentId}`, {
    headers: getAuthHeaders(),
  });
};

export const getAnnotationsByDocumentId = (documentId: number) => {
  return api.get(`/public/annotation/document/${documentId}`, {
    headers: getAuthHeaders(),
  });
};

export const createAnnotation = (data: {
  documentId: number;
  selectedText: string;
  startNo: number;
  endNo: number;
  description: string;
  tags: string[];
}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return api.post("/annotation", data, { headers });
};
