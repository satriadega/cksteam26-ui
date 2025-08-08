import React, { useState, useEffect } from "react";
import { getDocuments } from "../api";
import type { Document } from "../types/document";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { showModal, hideModal } from "../store/modalSlice";
import type { RootState } from "../store";

const ArsipPage: React.FC = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      dispatch(showModal({ type: "loading", message: "Loading..." }));
      try {
        const response = await getDocuments(
          currentPage - 1, // Adjusting to 0-indexed for API
          searchTerm?.trim() || undefined
        );
        setDocuments(response.data.data.content);
        setTotalPages(response.data.data.total_pages);
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 400) {
          setDocuments([]);
          setTotalPages(0);
        } else {
          console.error("Error fetching documents:", error);
        }
      } finally {
        dispatch(hideModal());
      }
    };

    fetchDocuments();
  }, [currentPage, searchTerm, dispatch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-8 max-w-4xl mx-auto mt-8">
      {documents.map((document) => (
        <div
          key={document.id}
          className="mb-8 p-6 border rounded-md bg-primary shadow-md"
        >
          <h2 className="text-3xl font-bold mb-2 text-title flex justify-between items-start">
            <span
              className="underline cursor-pointer"
              onClick={() => navigate(`/arsip/${document.id}`)}
            >
              {document.title}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-lg font-normal text-text-light">
                Version {document.version + 1}.{document.subversion}
              </span>
              <button
                onClick={() => {}}
                className="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-button-highlight-blue text-sm"
              >
                Lihat Versi
              </button>
            </div>
          </h2>
          <p className="text-text-main mb-4">
            {document.content.length > 250
              ? `${document.content.substring(0, 250)}...`
              : document.content}
          </p>
          <div className="mb-4">
            {document.tags && document.tags.length > 0 ? (
              <span className="font-semibold text-text-main">
                Tags:{" "}
                {(() => {
                  const uniqueTagsMap = new Map<string, string>(); // Map: lowercaseTagName -> originalTagName
                  document.tags.forEach(tag => {
                    const lowerCaseTagName = tag.tagName.toLowerCase();
                    if (!uniqueTagsMap.has(lowerCaseTagName)) {
                      uniqueTagsMap.set(lowerCaseTagName, tag.tagName);
                    }
                  });
                  const uniqueTagNamesToDisplay = Array.from(uniqueTagsMap.values());
                  return uniqueTagNamesToDisplay.map((tagName) => (
                    <span
                      key={tagName} // Use tagName as key for uniqueness
                      className="inline-block mr-2 px-2 py-1 bg-secondary text-text-main text-sm rounded-full"
                    >
                      {tagName}
                    </span>
                  ));
                })()}
              </span>
            ) : (
              <span className="font-semibold text-text-main">
                Belum memiliki tags untuk saat ini.
              </span>
            )}
          </div>
          <div className="text-text-light text-sm">
            {document.name} &bull;{" "}
            {new Date(document.createdAt).toLocaleDateString()} &bull;{" "}
            {document.annotationCount !== null && document.annotationCount > 0
              ? `Memiliki ${document.annotationCount} Pengetahuan`
              : "Belum memiliki pengetahuan"}
          </div>
        </div>
      ))}

      {documents.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Belum ada arsip ditemukan.
        </div>
      )}

      {documents.length > 0 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? "bg-accent text-white"
                  : "bg-primary text-text-main hover:bg-secondary"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArsipPage;
