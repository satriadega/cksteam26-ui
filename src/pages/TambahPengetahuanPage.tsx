import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  getDocumentById,
  createAnnotation,
  getRelatedDocuments,
  getApplianceStatus,
} from "../api";
import { useSearchParams, Link } from "react-router-dom";
import type { Document, Annotation, Version } from "../types/document";
import { showModal, hideModal } from "../store/modalSlice";
import { AxiosError } from "axios";
import { isAuthenticated as checkAuthStatus } from "../utils/auth";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const dateForComparison = new Date(date);
  dateForComparison.setHours(0, 0, 0, 0);
  const todayForComparison = new Date(today);
  todayForComparison.setHours(0, 0, 0, 0);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("id-ID", options);
  const diffDays = Math.floor(
    (todayForComparison.getTime() - dateForComparison.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diffDays === 0
    ? `Hari ini, ${formatter.format(date)}`
    : `${diffDays} hari yang lalu, ${formatter.format(date)}`;
};

const TambahPengetahuanPage: React.FC = () => {
  const dispatch = useDispatch();
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId");
  const [selectedText, setSelectedText] = useState("");
  const [showAnnotationBox, setShowAnnotationBox] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [autoMarking, setAutoMarking] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [canAddKnowledge, setCanAddKnowledge] = useState(false); // New state for adding knowledge
  const [showPendingMessage, setShowPendingMessage] = useState(false); // New state for pending message

  const stopMarkText = () => {
    setAutoMarking(false);
    setShowAnnotationBox(false);
  };
  const handleMarkText = useCallback(() => {
    handleAutoMarkingToggle();
    const getSelectionPosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0)
        return { startPos: 0, endPos: 0 };
      const range = selection.getRangeAt(0);
      if (!contentRef.current) return { startPos: 0, endPos: 0 };

      let startPos = 0;
      let endPos = 0;
      let foundStart = false;

      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (node === range.startContainer) {
          startPos += range.startOffset;
          foundStart = true;
        } else if (!foundStart) {
          startPos += node.textContent?.length || 0;
        }
        if (node === range.endContainer) {
          endPos =
            startPos + (range.endOffset - (foundStart ? range.startOffset : 0));
          break;
        }
      }

      return { startPos, endPos };
    };

    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection && contentRef.current.contains(selection.anchorNode)) {
        setSelectedText(selection.toString());
        const { startPos, endPos } = getSelectionPosition();
        setStart(startPos);
        setEnd(endPos);
      } else {
        setSelectedText("");
        setStart(0);
        setEnd(0);
      }
      setShowAnnotationBox(true);
    }
  }, [contentRef, setSelectedText, setStart, setEnd, setShowAnnotationBox]);

  interface CustomError extends Error {
    response?: {
      data?: {
        data?: { field: string; message: string }[];
        message?: string;
        error_code?: string; // Added error_code
      };
      status?: number; // Added status
    };
  }

  const handleAnnotationSubmit = async () => {
    if (!currentDocument) return;
    const annotationData = {
      documentId: currentDocument.id,
      selectedText,
      startNo: start,
      endNo: end,
      description,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    };
    try {
      await createAnnotation(annotationData);
      setShowAnnotationBox(false);
      setDescription("");
      setTags("");
      // Refetch the document data after successfully saving an annotation
      const docResponse = await getDocumentById(currentDocument.id);
      setCurrentDocument(docResponse.data);
      if (docResponse.data.annotations) {
        setAnnotations(docResponse.data.annotations);
      }
      stopMarkText();
    } catch (error: unknown) {
      const customError = error as CustomError;
      if (customError instanceof Error) {
        console.error("Error creating annotation:", customError.message);
        if (customError.response && customError.response.data) {
          const errorData = customError.response.data;
          if (errorData.data && Array.isArray(errorData.data)) {
            errorData.data.forEach(
              (err: { field: string; message: string }) => {
                dispatch(
                  showModal({
                    type: "error",
                    message: `Error in ${err.field}: ${err.message}`,
                  })
                );
              }
            );
          } else if (
            errorData.message &&
            errorData.message.includes("Authentication")
          ) {
            dispatch(
              showModal({
                type: "error",
                message: "Authentication error. Please log in again.",
              })
            );
          } else {
            dispatch(
              showModal({
                type: "error",
                message:
                  errorData.message ||
                  "Gagal membuat anotasi. Silakan coba lagi.",
              })
            );
          }
        } else {
          dispatch(
            showModal({
              type: "error",
              message: "Gagal membuat anotasi. Silakan coba lagi.",
            })
          );
        }
      } else {
        console.error("Unknown error creating annotation:", customError);
        dispatch(
          showModal({
            type: "error",
            message: "Gagal membuat anotasi. Silakan coba lagi.",
          })
        );
      }
    }
  };

  const handleShowVersions = async () => {
    if (currentDocument && currentDocument.referenceDocumentId) {
      try {
        const response = await getRelatedDocuments(
          currentDocument.referenceDocumentId
        );
        if (response.data.data.length === 0) {
          dispatch(
            showModal({
              type: "info",
              message: "Belum ada versi lain.",
            })
          );
        } else {
          setVersions(response.data.data);
          setShowVersions(!showVersions);
        }
      } catch (error) {
        console.error("Error fetching related documents:", error);
      }
    }
  };

  const handleAutoMarkingToggle = () => {
    setAutoMarking(!autoMarking);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!contentRef.current) return;
      const selection = window.getSelection();
      if (
        !selection ||
        selection.isCollapsed ||
        !contentRef.current.contains(selection.anchorNode)
      ) {
        return;
      }
      handleMarkText();
    };
    if (autoMarking) {
      document.addEventListener("selectionchange", handleSelectionChange);
    } else {
      document.removeEventListener("selectionchange", handleSelectionChange);
    }
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [autoMarking, handleMarkText]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        dispatch(showModal({ type: "loading", message: "Memuat dokumen..." }));
        try {
          const docId = parseInt(documentId, 10);
          const docResponse = await getDocumentById(docId);
          setCurrentDocument(docResponse.data);
          if (docResponse.data.annotations) {
            setAnnotations(docResponse.data.annotations);
          }

          // Check appliance status for this document
          if (checkAuthStatus()) {
            // Only check if authenticated
            try {
              const applianceResponse = await getApplianceStatus(docId, true); // Pass true to ignoreAuthError
              if (
                applianceResponse.data &&
                applianceResponse.data.success &&
                applianceResponse.data.data
              ) {
                if (applianceResponse.data.data.accepted === false) {
                  setShowPendingMessage(true);
                  setCanAddKnowledge(false);
                } else {
                  setCanAddKnowledge(true); // User is accepted verifier
                  setShowPendingMessage(false);
                }
              } else {
                setCanAddKnowledge(false); // Not a verifier or no data
                setShowPendingMessage(false);
              }
            } catch (error) {
              const axiosError = error as AxiosError;
              // If it's an expected auth error (401/403), a 404 (not found),
              // or a 400 with "DATA IS NOT FOUND" (DOC05FV055), treat as not a verifier
              if (
                axiosError.response &&
                (axiosError.response.status === 401 ||
                  axiosError.response.status === 403 ||
                  axiosError.response.status === 404 ||
                  (axiosError.response.status === 400 &&
                    (axiosError.response.data as any)?.error_code ===
                      "DOC05FV055" &&
                    (axiosError.response.data as any)?.message ===
                      "DATA IS NOT FOUND"))
              ) {
                setCanAddKnowledge(false); // Not a verifier or not logged in
                setShowPendingMessage(false);
                console.warn(
                  "Failed to fetch appliance status (expected for unauthenticated/not found/not a verifier):",
                  axiosError
                );
              } else {
                console.error("Error fetching appliance status:", error);
                setCanAddKnowledge(false); // Default to false on unexpected error
                setShowPendingMessage(false);
              }
            }
          } else {
            setCanAddKnowledge(false); // Not authenticated, cannot add knowledge
            setShowPendingMessage(false);
          }

          dispatch(hideModal());
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              "Error fetching document or related documents:",
              error.message
            );
          } else {
            console.error(
              "Unknown error fetching document or related documents:",
              error
            );
          }
          dispatch(
            showModal({
              type: "error",
              message: "Gagal memuat dokumen. Silakan coba lagi.",
            })
          );
        }
      }
    };
    fetchData();
  }, [documentId, dispatch]); // Added dispatch to dependencies

  if (!currentDocument) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 mt-8 mb-8 border rounded-lg">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold mb-2 border-b-2 border-black inline-block">
          {currentDocument.title}
        </h1>
        <p className="text-text-light text-sm">
          Dibuat oleh {currentDocument.name}
          <br />
          Dipublish {formatDate(currentDocument.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-text-main text-sm mb-2">
          Version {currentDocument.version}.{currentDocument.subversion}
        </p>
        <div className="relative">
          <button
            onClick={handleShowVersions}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
          >
            Lihat Versi
          </button>
          {showVersions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <ul>
                {versions.map((version) => (
                  <li
                    key={version.id}
                    className="hover:bg-gray-100 cursor-pointer text-sm font-normal"
                  >
                    <Link
                      to={`/arsip/${version.id}`}
                      className="block px-4 py-2"
                    >
                      Version {version.version}.{version.subversion || 0}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div
        className="mb-6 text-lg text-left user-select-text whitespace-pre-wrap overflow-y-auto h-[40vh] mt-6"
        ref={contentRef}
        id="document-content"
      >
        <p>{currentDocument.content}</p>
      </div>

      <div className="flex space-x-4 mb-8">
        {showPendingMessage && (
          <p className="text-center text-gray-600 font-semibold bg-yellow-400 p-2 rounded-sm">
            Sedang menunggu diterima
          </p>
        )}
        {canAddKnowledge && (
          <>
            <button
              onClick={handleMarkText}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              {autoMarking === true
                ? "Sedang menandai kalimat"
                : "Tandai kalimat"}
            </button>
            {autoMarking && (
              <button
                onClick={stopMarkText}
                className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
              >
                Berhenti menandai kalimat
              </button>
            )}
          </>
        )}
      </div>

      {canAddKnowledge && showAnnotationBox && (
        <div className="p-4 border rounded-md mt-4 text-left">
          <h3 className="text-lg font-bold mb-2">Buat Anotasi</h3>
          {selectedText && (
            <p className="mb-2 text-xs text-gray-600">
              Teks terpilih: "{selectedText}"
            </p>
          )}
          {!selectedText && (
            <p className="mb-2 text-xs text-gray-600">
              Tidak ada teks yang dipilih. Tandai teks dalam arsip dengan drag.
            </p>
          )}
          <p className="mb-2 text-xs text-gray-600">
            Start: {start}, End: {end}
          </p>
          <textarea
            className="w-full h-24 p-2 border rounded-md mb-2"
            placeholder="Deskripsi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Tags (pisahkan dengan koma)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button
            onClick={handleAnnotationSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Simpan Anotasi
          </button>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6">Pengetahuan Arsip</h2>
      {annotations && annotations.length > 0 ? (
        <div className="space-y-6">
          {annotations.map((item, index) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0">
              <h3 className="text-sm font-semibold mb-2">
                {index + 1}. {item.selectedText}
              </h3>
              <p className="text-text-main text-sm mb-1">
                Deskripsi: {item.description}
              </p>
              <p className="text-text-light text-sm mb-1">
                Dibuat {formatDate(item.createdAt)}
              </p>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap items-center text-text-light text-sm mb-1">
                  <span className="mr-2">Tags:</span>
                  {item.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="ml-2 px-2 py-1 bg-gray-200 rounded"
                    >
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-main">Belum memiliki pengetahuan.</p>
      )}
    </div>
  );
};

export default TambahPengetahuanPage;
