import React, { useEffect, useState, useCallback } from "react";
import { getVerifierAnnotations } from "../api";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import type { RootState } from "../store";
interface Tag {
  id: number;
  tagName: string;
  createdAt: string;
  updatedAt: string | null;
}

interface VerifierData {
  annotationId: number;
  documentId: number;
  documentName: string;
  username: string;
  fullName: string;
  isVerified: boolean;
  selectedText: string;
  startNo: number;
  endNo: number;
  description: string;
  tags: Tag[];
  createdAt: string;
  verified: boolean;
}

const ListVerifierPage: React.FC = () => {
  const [data, setData] = useState<VerifierData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const annotationsResponse = await getVerifierAnnotations();

      if (annotationsResponse.data.success) {
        setData(annotationsResponse.data.data);
      } else {
        setError(annotationsResponse.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 400) {
        setError("Belum ada pengetahuan untuk di verify");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    fetchData();

    window.addEventListener("focus", fetchData);

    return () => {
      window.removeEventListener("focus", fetchData);
    };
  }, [fetchData]);

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white pt-8">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl rounded-lg w-full max-w-4xl">
        <h3 className="text-2xl font-bold text-center mb-6">
          List Verifier Pengetahuan
        </h3>
        {loading && <p className="text-center">Loading annotations...</p>}
        {error && <p className="text-center ">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p className="text-center">Belum ada data anotasi.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <ul className="space-y-4">
            {data.map((item) => (
              <li
                key={item.documentId + item.createdAt}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex-1">
                  <p className="text-lg">
                    <span className="font-semibold">
                      {item.fullName} (@{item.username})
                    </span>{" "}
                    membuat pengetahuan pada dokumen{" "}
                    <a
                      href={`/arsip/${item.documentId}`}
                      className="text-blue-600 hover:underline"
                    >
                      "{item.documentName}"
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    "{item.selectedText}"
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Tags:{" "}
                    {item.tags.length > 0
                      ? item.tags.map((tag) => tag.tagName).join(", ")
                      : "tidak ada tags"}
                  </p>
                </div>
                <div className="flex space-x-2 flex-col gap-2 md:flex-row items-center">
                  {profile && profile.username === item.username ? (
                    <>
                      <span className="text-sm text-yellow-600">
                        Sedang menunggu pengetahuan untuk diterima
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/edit-pengetahuan/${item.documentId}`)
                        }
                        className="ml-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
                      >
                        Edit Pengetahuan
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(`/verify-pengetahuan/${item.annotationId}`)
                      }
                      className="ml-2 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                      Detail
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ListVerifierPage;
