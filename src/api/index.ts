import axios from "axios";
import { isAuthenticated, clearAuth } from "../utils/auth";
import type { Document } from "../types/document";

const API_URL = "http://localhost:8081";

import type { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data?.error_code === "X01001")
    ) {
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

export const getDocuments = (page = 0, searchTerm = "") => {
  const params: { keyword?: string; page?: number } = {};
  if (searchTerm?.trim()) {
    params.keyword = searchTerm.trim();
  }
  params.page = page;

  return api
    .get(`/public/document`, {
      headers: getAuthHeaders(),
      params,
    })
    .then((response) => {
      const documents = response.data.data.content.map((doc: Document) => ({
        ...doc,
        isError: doc.isError,
      }));
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...response.data.data,
            content: documents,
          },
        },
      };
    });
};

export const getMyDocuments = (
  page = 0,
  value = "", // This will now be the value for the filter
  sort = "asc",
  sortBy = "id",
  column = "title" // This will now be the column for the filter
) => {
  const params: { column?: string; value?: string } = {};
  if (value?.trim()) {
    params.column = column;
    params.value = value.trim();
  }

  return api
    .get(`/document/${sort}/${sortBy}/${page}`, {
      headers: getAuthHeaders(),
      params,
    })
    .then((response) => {
      const documents = response.data.data.content.map((doc: Document) => ({
        ...doc,
        isError: doc.isError,
      }));
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...response.data.data,
            content: documents,
          },
        },
      };
    });
};

export const checkVerifierStatus = (id: number) => {
  return api.get(`/appliance/${id}`, { headers: getAuthHeaders() });
};

export const registerAsVerifier = (id: number) => {
  return api.post(`/appliance/${id}`, null, { headers: getAuthHeaders() });
};

export const getDocumentById = (id: number) => {
  return api
    .get(`/public/document/${id}`, { headers: getAuthHeaders() })
    .then((response) => {
      return response.data;
    });
};

export const getProfile = () => {
  return api.get("/profile", { headers: getAuthHeaders() }).then((response) => {
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

export const getAnnotations = (
  page = 0,
  searchTerm = "",
  sort = "asc",
  sortBy = "id",
  column = "selectedText"
) => {
  const params: { column?: string; value?: string } = {};
  if (searchTerm?.trim()) {
    params.column = column;
    params.value = searchTerm.trim();
  }

  return api.get(`/annotation/${sort}/${sortBy}/${page}`, {
    headers: getAuthHeaders(),
    params,
  });
};
