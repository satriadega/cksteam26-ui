import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getDocuments, getAnnotations } from "../api";
import { showModal, hideModal } from "../store/modalSlice";
import type { Document } from "../types/document";
import type { Annotation } from "../types/annotation";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [annotationSearchTerm, setAnnotationSearchTerm] = useState("");
  const [annotationSearchQuery, setAnnotationSearchQuery] = useState("");
  const [annotationFilterColumn, setAnnotationFilterColumn] =
    useState("selectedText");
  const [visibility, setVisibility] = useState("public");
  const [documentVerified, setDocumentVerified] = useState("verified");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [annotationCurrentPage, setAnnotationCurrentPage] = useState(0);
  const [annotationTotalPages, setAnnotationTotalPages] = useState(0);
  const [sort, setSort] = useState("asc");
  const sortBy = "title";
  const [annotationSort, setAnnotationSort] = useState("asc");
  const annotationSortBy = "id";

  useEffect(() => {
    const fetchDocuments = async () => {
      dispatch(showModal({ type: "loading", message: "Loading..." }));
      try {
        const response = await getDocuments(
          currentPage,
          searchQuery,
          sort,
          sortBy
        );
        setDocuments(response.data.data.content);
        setTotalPages(response.data.data.total_pages);
        dispatch(hideModal());
      } catch {
        setError("Arsip tidak ditemukan!");
        dispatch(hideModal());
      }
    };

    fetchDocuments();
  }, [currentPage, searchQuery, sort, sortBy, dispatch]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      dispatch(showModal({ type: "loading", message: "Loading..." }));
      try {
        const response = await getAnnotations(
          annotationCurrentPage,
          annotationSearchQuery,
          annotationSort,
          annotationSortBy,
          annotationFilterColumn
        );
        if (response.data.data.content.length === 0) {
          setAnnotations([]);
        } else {
          setAnnotations(response.data.data.content);
        }
        setAnnotationTotalPages(response.data.data.total_pages);
        dispatch(hideModal());
      } catch {
        setAnnotations([]);
        setError("Pengetahuan tidak ditemukan!");
        dispatch(hideModal());
      }
    };

    fetchAnnotations();
  }, [
    annotationCurrentPage,
    annotationSearchQuery,
    annotationSort,
    annotationSortBy,
    annotationFilterColumn,
    dispatch,
  ]);

  const filteredDocuments =
    documents?.filter((doc) => {
      const titleMatch = doc.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const visibilityMatch =
        (visibility === "public" && doc.publicVisibility && !doc.private) ||
        (visibility === "pribadi" && !doc.publicVisibility && doc.private) ||
        (visibility === "organisasi" && !doc.publicVisibility && !doc.private);
      const verifiedMatch =
        (documentVerified === "unverified" && doc.isVerifiedAll) ||
        (documentVerified === "verified" && !doc.isVerifiedAll);

      return titleMatch && visibilityMatch && verifiedMatch;
    }) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Dashboard</h1>
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mb-8">
        <button className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto">
          Buat Organisasi
        </button>
        <button className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto">
          Buat Arsip
        </button>
        <button className="bg-gray-800 text-white px-6 py-2 rounded w-full md:w-auto">
          Perbarui Organisasi
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">List Arsipku</h2>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Judul Arsip"
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchQuery(searchTerm);
            }
          }}
        />
        <button
          onClick={() => setSearchQuery(searchTerm)}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Cari
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="asc">Urutan Naik</option>
          <option value="desc">Urutan Turun</option>
        </select>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="public">Publik</option>
          <option value="pribadi">Pribadi</option>
          <option value="organisasi">Organisasi</option>
        </select>
        <select
          value={documentVerified}
          onChange={(e) => setDocumentVerified(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="verified">Telah Diverifikasi</option>
          <option value="unverified">Belum Diverifikasi</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="p-4 border rounded shadow">
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
                <Link
                  to={`/arsip/${doc.id}`}
                  className="bg-gray-800 text-white px-4 py-2 rounded text-center w-full min-w-[280px]"
                >
                  Lihat Pengetahuan
                </Link>
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
          </div>
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

      <h2 className="text-2xl font-bold text-center mb-4 mt-8">
        List Pengetahuan
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
          placeholder="Search Annotations"
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

      {error && annotations.length === 0 && (
        <p className="text-red-500">{error}</p>
      )}

      {annotations.length > 0 && (
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <div
              key={annotation.documentId}
              className="p-4 border rounded shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="max-w-full md:w-auto">
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
