import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getMyDocuments } from "../api";
import { showModal, hideModal } from "../store/modalSlice";
import type { Document } from "../types/document";
import type { Annotation } from "../types/annotation";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [annotations] = useState<Annotation[]>([]);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // This will be the actual query sent to API
  const [documentFilterColumn] = useState("title");
  const [documentSort, setDocumentSort] = useState("asc");
  const documentSortBy = "id"; // Default sort by ID for documents

  const [annotationSearchTerm, setAnnotationSearchTerm] = useState("");
  const [, setAnnotationSearchQuery] = useState("");
  const [annotationFilterColumn, setAnnotationFilterColumn] =
    useState("selectedText");
  const [visibility, setVisibility] = useState("public");
  const [documentVerified, setDocumentVerified] = useState("verified");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [annotationCurrentPage, setAnnotationCurrentPage] = useState(0);
  const [annotationTotalPages] = useState(0);
  const [annotationSort, setAnnotationSort] = useState("asc");

  // New state to manage active filter type
  const [activeDocumentFilter, setActiveDocumentFilter] = useState<
    "search" | "visibility" | "verified" | "none"
  >("none");

  const fetchDocuments = useCallback(async () => {
    dispatch(showModal({ type: "loading", message: "Loading..." }));
    setDocumentError(null);
    try {
      let filterColumnToSend = "";
      let filterValueToSend = "";

      if (activeDocumentFilter === "search" && searchQuery.trim()) {
        filterColumnToSend = documentFilterColumn;
        filterValueToSend = searchQuery;
      } else if (activeDocumentFilter === "visibility") {
        if (visibility === "public") {
          filterColumnToSend = "publicVisibility";
          filterValueToSend = "true";
        } else if (visibility === "pribadi") {
          filterColumnToSend = "private";
          filterValueToSend = "true";
        } else if (visibility === "organisasi") {
          filterColumnToSend = "private";
          filterValueToSend = "false"; // Assuming private=false means organization
        }
      } else if (activeDocumentFilter === "verified") {
        filterColumnToSend = "isVerifiedAll";
        filterValueToSend = documentVerified === "verified" ? "true" : "false";
      }

      console.log("Fetching documents with parameters:");
      console.log("currentPage:", currentPage);
      console.log("filterValueToSend:", filterValueToSend);
      console.log("documentSort:", documentSort);
      console.log("documentSortBy:", documentSortBy);
      console.log("filterColumnToSend:", filterColumnToSend);

      const response = await getMyDocuments(
        currentPage,
        filterValueToSend, // Pass the determined filter value
        documentSort,
        documentSortBy,
        filterColumnToSend // Pass the determined filter column
      );
      setDocuments(response.data.data.content);
      setTotalPages(response.data.data.total_pages);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocumentError("Arsip tidak ditemukan!");
      setDocuments([]);
      setTotalPages(0);
    } finally {
      dispatch(hideModal());
    }
  }, [
    currentPage,
    searchQuery,
    documentSort,
    documentSortBy,
    documentFilterColumn,
    visibility,
    documentVerified,
    activeDocumentFilter,
    dispatch,
  ]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handlers for filter changes
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setActiveDocumentFilter("search");
    setVisibility("public"); // Reset other filters
    setDocumentVerified("verified"); // Reset other filters
    setCurrentPage(0);
  };

  const handleDocumentVerifiedChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDocumentVerified(e.target.value);
    setActiveDocumentFilter("verified");
    setSearchTerm(""); // Reset other filters
    setSearchQuery(""); // Reset other filters
    setVisibility("public"); // Reset other filters
    setCurrentPage(0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Dashboard</h1>
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mb-8">
        <Link
          to="/buat-organisasi"
          className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto text-center"
        >
          Buat Organisasi
        </Link>
        <Link
          to="/perbarui-organisasi"
          className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto text-center"
        >
          Perbarui Organisasi
        </Link>
        <Link
          to="/buat-arsip"
          className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto text-center"
        >
          Buat Arsip
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">List Arsipku</h2>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari Arsip"
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Cari
        </button>
        <select
          value={documentSort}
          onChange={(e) => setDocumentSort(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="asc">Urutan Naik</option>
          <option value="desc">Urutan Turun</option>
        </select>
        <select
          value={documentVerified}
          onChange={handleDocumentVerifiedChange}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="verified">Telah Diverifikasi</option>
          <option value="unverified">Belum Diverifikasi</option>
        </select>
      </div>

      {documentError && <p className="text-red-500">{documentError}</p>}

      <div className="space-y-4">
        {documents
          ?.filter((doc) => !doc.isError) // Keep only the isError filter
          .map((doc) => (
            <Link
              to={`/arsip/${doc.id}`}
              key={doc.id}
              className="block p-4 border rounded shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div
                  className="
              max-w-full
              md:max-w-[calc(100%-300px)] md:w-auto"
                >
                  <h3 className="text-xl font-bold">{doc.title}</h3>
                  <p className="text-sm text-gray-500">
                    Version {doc.version}.{doc.subversion}
                  </p>
                  <p className="text-sm text-gray-500">
                    {doc.isVerifiedAll
                      ? "Belum Diverifikasi"
                      : "Telah Diverifikasi"}
                  </p>
                  <p className="mt-2 " style={{ wordWrap: "break-word" }}>
                    {doc.content.substring(0, 300)}...
                  </p>
                  <div className="mt-2">
                    {doc.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                      >
                        #{tag.tagName}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Dibuat oleh {doc.name} pada{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 mt-4 md:mt-0 w-full md:w-auto">
                  <div className="bg-gray-800 text-white px-4 py-2 rounded text-center w-full min-w-[280px]">
                    Lihat Arsip
                  </div>
                  {doc.isAnnotable && (
                    <Link
                      to={`/tambah-pengetahuan?documentId=${doc.id}`}
                      className="bg-gray-800 text-white px-4 py-2 rounded w-full text-center min-w-[280px]"
                    >
                      Tambahkan Pengetahuan
                    </Link>
                  )}
                </div>
              </div>
            </Link>
          ))}
      </div>
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          <span className="hidden md:inline">{"<"}</span>
          <span className="md:hidden">Prev</span>
        </button>
        <span>
          {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          <span className="hidden md:inline">{">"}</span>
          <span className="md:hidden">Next</span>
        </button>
      </div>

      <div className="space-y-4">
        {documents
          ?.filter((doc) => doc.isError) // Keep only the isError filter
          .map((doc) => (
            <Link
              to={`/arsip/${doc.id}`}
              key={doc.id}
              className="block p-4 border rounded shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div
                  className="
        max-w-full
        md:max-w-[calc(100%-300px)] md:w-auto"
                >
                  <h3 className="text-xl font-bold">{doc.title}</h3>
                  <p className="text-sm text-gray-500">
                    Version {doc.version}.{doc.subversion}
                  </p>
                  <p className="text-sm text-gray-500">
                    {doc.isVerifiedAll
                      ? "Belum Diverifikasi"
                      : "Telah Diverifikasi"}
                  </p>
                  <p className="mt-2 " style={{ wordWrap: "break-word" }}>
                    {doc.content.substring(0, 300)}...
                  </p>
                  <div className="mt-2">
                    {doc.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                      >
                        #{tag.tagName}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Dibuat oleh {doc.name} pada{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 mt-4 md:mt-0 w-full md:w-auto">
                  <div className="bg-gray-800 text-white px-4 py-2 rounded text-center w-full min-w-[280px]">
                    Lihat Arsip
                  </div>
                  {doc.isAnnotable && (
                    <Link
                      to={`/tambah-pengetahuan?documentId=${doc.id}`}
                      className="bg-gray-800 text-white px-4 py-2 rounded w-full text-center min-w-[280px]"
                    >
                      Tambahkan Pengetahuan
                    </Link>
                  )}
                </div>
              </div>
            </Link>
          ))}
      </div>

      <h2 className="text-2xl font-bold text-center mb-4 mt-8">
        List Pengetahuanku
      </h2>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <select
          value={annotationFilterColumn}
          onChange={(e) => setAnnotationFilterColumn(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="selectedText">Kata yang ditandai</option>
          <option value="description">Deskripsi</option>
          <option value="createdAt">Dibuat</option>
        </select>
        <input
          type="text"
          placeholder="Judul Pengetahuan"
          className="w-full p-2 border rounded"
          value={annotationSearchTerm}
          onChange={(e) => setAnnotationSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setAnnotationSearchQuery(annotationSearchTerm);
            }
          }}
        />
        <button
          onClick={() => setAnnotationSearchQuery(annotationSearchTerm)}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Cari
        </button>
        <select
          value={annotationSort}
          onChange={(e) => setAnnotationSort(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="asc">Urutan Naik</option>
          <option value="desc">Urutan Turun</option>
        </select>
      </div>

      {annotations.length === 0 && (
        <p className="text-red-500">Pengetahuan tidak ditemukan!</p>
      )}

      {annotations.length > 0 && (
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <div
              key={annotation.documentId}
              className="p-4 border rounded shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="md:max-w-[calc(100%-300px)] md:w-auto">
                  <h3 className="text-xl font-bold">
                    {annotation.selectedText}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {annotation.isVerified
                      ? "Telah Diverifikasi"
                      : "Belum Diverifikasi"}
                  </p>
                  <p className="mt-2">{annotation.description}</p>
                  <div className="mt-2">
                    {annotation.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                      >
                        #{tag.tagName}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Dibuat pada{" "}
                    {new Date(annotation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 mt-4 md:mt-0 w-full md:w-auto">
                  <Link
                    to={`/buat-arsip?documentId=${annotation.documentId}`}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-center w-full min-w-[280px]"
                  >
                    Lihat Arsip
                  </Link>
                  <Link
                    to={`/tambah-pengetahuan?documentId=${annotation.documentId}`}
                    className="bg-gray-800 text-white px-4 py-2 rounded w-full text-center min-w-[280px]"
                  >
                    Edit Pengetahuan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          onClick={() => setAnnotationCurrentPage(annotationCurrentPage - 1)}
          disabled={annotationCurrentPage === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          <span className="hidden md:inline">{"<"}</span>
          <span className="md:hidden">Prev</span>
        </button>
        <span>
          {annotationCurrentPage + 1} of {annotationTotalPages}
        </span>
        <button
          onClick={() => setAnnotationCurrentPage(annotationCurrentPage + 1)}
          disabled={annotationCurrentPage === annotationTotalPages - 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          <span className="hidden md:inline">{">"}</span>
          <span className="md:hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
