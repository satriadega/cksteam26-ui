import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getDocuments } from "../api";
import { showModal, hideModal } from "../store/modalSlice";
import type { Document } from "../types/document";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [verified, setVerified] = useState("verified");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("asc");
  const sortBy = "title";

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
        setError("Failed to fetch documents");
        dispatch(hideModal());
      }
    };

    fetchDocuments();
  }, [currentPage, searchQuery, sort, sortBy, dispatch]);

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
        (verified === "unverified" && doc.isVerifiedAll) ||
        (verified === "verified" && !doc.isVerifiedAll);

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
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
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
              <div className="w-full md:w-auto">
                <h3 className="text-xl font-bold">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  Version {doc.version}.{doc.subversion}
                </p>
                <p className="text-sm text-gray-500">
                  {doc.isVerifiedAll ? "UnVerified" : "Verified"}
                </p>
                <p className="mt-2">{doc.content.substring(0, 100)}...</p>
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
                  {doc.username} -{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col space-y-2 mt-4 md:mt-0 w-full md:w-auto">
                <Link
                  to={`/arsip/${doc.id}`}
                  className="bg-gray-800 text-white px-4 py-2 rounded text-center w-full"
                >
                  Lihat Pengetahuan
                </Link>
                <Link
                  to={`/tambah-pengetahuan?documentId=${doc.id}`}
                  className="bg-gray-800 text-white px-4 py-2 rounded w-full text-center"
                >
                  Tambahkan Pengetahuan
                </Link>
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
    </div>
  );
};

export default DashboardPage;
