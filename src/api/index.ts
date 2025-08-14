import axios from "axios";
import { isAuthenticated, clearAuth } from "../utils/auth";
import type { Document } from "../types/document";

// Access the runtime configuration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runtimeConfig = (window as any).runtimeConfig;

// Use the API URL from the runtime configuration, or a default value if it's not set.
export const API_URL =
  runtimeConfig?.VITE_API_URL || "http://localhost:8084";

import type { AxiosRequestConfig, AxiosError } from "axios";

interface ApiErrorData {
  error_code?: string;
  message?: string;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorCode = error.response?.data?.error_code;
    const currentPath = window.location.pathname;

    // On DetailArsipPage or BuatArsipPage, do not redirect on X01001
    if (
      (currentPath.startsWith("/arsip/") ||
        currentPath.startsWith("/buat-arsip")) &&
      errorCode === "X01001"
    ) {
      return Promise.reject(error);
    }

    // For other cases, redirect on any authentication error
    if (error.response?.status === 401 || errorCode === "X01001") {
      clearAuth();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

const getAuthHeaders = (
  ignoreAuthError = false
): AxiosRequestConfig["headers"] => {
  const headers: AxiosRequestConfig["headers"] = {};
  if (isAuthenticated()) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  if (ignoreAuthError) {
    headers["X-Ignore-Auth-Error"] = "true"; // Custom header to signal interceptor
  }
  return headers;
};

export const getDocuments = async (page = 0, searchTerm = "") => {
  const params: { keyword?: string; page?: number } = {};
  if (searchTerm?.trim()) {
    params.keyword = searchTerm.trim();
  }
  params.page = page;

  const config: AxiosRequestConfig = { params };
  if (isAuthenticated()) {
    config.headers = getAuthHeaders();
  }

  try {
    const response = await api.get(`/public/document`, config);
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
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status === 400) {
      return {
        data: {
          data: {
            content: [],
            total_pages: 0,
          },
        },
      };
    }
    throw error;
  }
};

export const getOrganizations = () => {
  return api.get("/organization", { headers: getAuthHeaders() });
};

export const createOrganization = (data: {
  organizationName: string;
  members: string[];
}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return api.post("/organization", data, { headers });
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

export const checkVerifierStatus = (id: number, ignoreAuthError = false) => {
  return api.get(`/appliance/${id}`, {
    headers: getAuthHeaders(ignoreAuthError),
  });
};

export const registerAsVerifier = (id: number, ignoreAuthError = false) => {
  return api.post(`/appliance/${id}`, null, {
    headers: getAuthHeaders(ignoreAuthError),
  });
};

export const getApplianceStatus = async (
  id: number,
  ignoreAuthError = false
) => {
  try {
    const response = await api.get(`/appliance/${id}`, {
      headers: getAuthHeaders(ignoreAuthError),
    });
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorData>;
    if (
      axiosError.response &&
      (axiosError.response.status === 401 ||
        axiosError.response.status === 403 ||
        axiosError.response.status === 404 ||
        (axiosError.response.status === 400 &&
          axiosError.response.data?.error_code === "DOC05FV055" &&
          axiosError.response.data?.message === "DATA IS NOT FOUND"))
    ) {
      // Return a specific structure for "not a verifier" cases
      return {
        data: {
          success: false,
          message: "Not a verifier or not found.",
        },
      };
    }
    // For other errors, re-throw them to be handled by the caller
    throw error;
  }
};

export const getDocumentById = (id: number) => {
  const config: AxiosRequestConfig = {};
  if (isAuthenticated()) {
    config.headers = getAuthHeaders();
  }
  return api.get(`/public/document/${id}`, config).then((response) => {
    return response.data;
  });
};

export const getProfile = () => {
  return api.get("/profile", { headers: getAuthHeaders() }).then((response) => {
    console.log("API - getProfile response data:", response.data);
    return response;
  });
};

export const updateProfile = (
  data: {
    name: string;
    password?: string;
    statusNotification: boolean;
  },
  file?: File | null
) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  if (file) {
    formData.append("file", file);
  }

  const headers = {
    "Content-Type": "multipart/form-data",
    ...getAuthHeaders(),
  };

  return api.put("/profile", formData, { headers });
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
  const config: AxiosRequestConfig = {};
  if (isAuthenticated()) {
    config.headers = getAuthHeaders();
  }
  return api.get(`/public/document/related/${documentId}`, config);
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

export const getOrganizationById = (id: number) => {
  return api.get(`/organization/${id}`, { headers: getAuthHeaders() });
};

export const updateOrganization = (
  id: number,
  data: {
    organizationName: string;
    addMember?: string[];
    removeMember?: string[];
  }
) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return api.put(`/organization/${id}`, data, { headers });
};

export const deleteOrganization = (id: number) => {
  return api.delete(`/organization/${id}`, { headers: getAuthHeaders() });
};

export const getVerifierAnnotations = () => {
  return api.get("/annotation/verifier", { headers: getAuthHeaders() });
};

export const updateAnnotationStatus = (annotationId: number, action: "accept" | "reject") => {
  return api.put(`/annotation/verifier/${annotationId}?action=${action}`, null, {
    headers: getAuthHeaders(),
  });
};

export const getAnnotationById = (annotationId: number) => {
  return api.get(`/annotation/detail/${annotationId}`, {
    headers: getAuthHeaders(),
  });
};
