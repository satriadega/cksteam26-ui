import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDocumentById, getProfile, getRelatedDocuments } from "../api";
import type { Document, Version } from "../types/document";
import { showModal, hideModal } from "../store/modalSlice";
import type { RootState } from "../store";
import { FaSpinner } from "react-icons/fa";

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

const DetailArsipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [document, setDocument] = useState<Document | null>(null);
  const [userProfile, setUserProfile] = useState({ username: "" });
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const { isAuthenticated, username: reduxUsername } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        dispatch(showModal({ type: "loading", message: "Memuat dokumen..." }));
        try {
          const documentId = parseInt(id, 10);
          const docResponse = await getDocumentById(documentId);
          setDocument(docResponse.data);

          if (isAuthenticated) {
            const profileResponse = await getProfile();
            if (
              profileResponse.data &&
              profileResponse.data.data &&
              profileResponse.data.data.length > 0
            ) {
              const fetchedUsername =
                profileResponse.data.data[0].username || "";
              setUserProfile({ username: fetchedUsername });
            } else {
              setUserProfile({ username: "" });
            }
          }

          dispatch(hideModal());
        } catch (error) {
          dispatch(
            showModal({
              type: "error",
              message: "Gagal memuat dokumen. Silakan coba lagi. " + error,
            })
          );
        }
      }
    };

    fetchData();
  }, [id, dispatch, isAuthenticated, reduxUsername]);

  const handleShowVersions = async () => {
    if (!document || !document.referenceDocumentId) return;

    setIsLoadingVersions(true);

    try {
      const response = await getRelatedDocuments(document.referenceDocumentId);
      if (response.data.data.length === 0) {
        dispatch(
          showModal({
            type: "info",
            message: "Belum ada versi lain.",
          })
        );
        setShowVersions(false);
      } else {
        setVersions(response.data.data);
        setShowVersions(true);
      }
    } catch (error) {
      dispatch(
        showModal({
          type: "error",
          message: "Gagal memuat versi. Silakan coba lagi. " + error,
        })
      );
      setShowVersions(false);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleVersionClick = () => {
    setShowVersions(false);
  };

  if (!document) return null;

  return (
    <div className="container mx-auto p-4 mt-8 mb-8 border rounded-lg">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold mb-2 border-b-2 border-black inline-block">
          {document.title}
        </h1>
        <p className="text-text-light text-sm">
          Dibuat oleh {document.name}
          <br />
          Dipublish {formatDate(document.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-text-main text-sm mb-2">
          Version {document.version + 1}.{document.subversion || 0}
        </p>
        <div className="relative inline-block">
          <button
            onClick={handleShowVersions}
            disabled={isLoadingVersions}
            className={`bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${
              isLoadingVersions ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {isLoadingVersions ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : null}
            Lihat Versi
          </button>
          {showVersions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <ul>
                {versions.map((version) => (
                  <li
                    key={version.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-normal"
                  >
                    <Link
                      to={`/arsip/${version.id}`}
                      onClick={handleVersionClick}
                    >
                      Version {version.version + 1}.{version.subversion || 0}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div
        className="mb-6 text-lg text-left user-select-text whitespace-pre-wrap mt-6 overflow-y-scroll h-[40vh]"
        id="document-content"
      >
        {document.content}
      </div>

      <div className="flex space-x-4 mb-8">
        {isAuthenticated ? (
          userProfile.username === document.username ? (
            <>
              {document.isAnnotable && (
                <>
                  <Link to={`/tambah-pengetahuan?documentId=${id}`}>
                    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                      Tambahkan Pengetahuan
                    </button>
                  </Link>
                  <Link to={`/buat-arsip?documentId=${id}`}>
                    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                      Tambahkan Versi
                    </button>
                  </Link>
                </>
              )}
            </>
          ) : (
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Daftar Menjadi Verifier
            </button>
          )
        ) : null}
      </div>

      <h2 className="text-3xl font-bold mb-6">Tags</h2>
      {document.annotations && document.annotations.length > 0 ? (
        <div className="flex flex-wrap">
          {(() => {
            const allTags = document.annotations.flatMap((a) => a.tags);
            const uniqueTagsMap = new Map<string, string>();
            allTags.forEach((tag) => {
              const lowerCaseTagName = tag.tagName.toLowerCase();
              if (!uniqueTagsMap.has(lowerCaseTagName)) {
                uniqueTagsMap.set(lowerCaseTagName, tag.tagName);
              }
            });
            const uniqueTagNamesToDisplay = Array.from(uniqueTagsMap.values());
            return uniqueTagNamesToDisplay.map((tagName) => (
              <span
                key={tagName}
                className="inline-block mr-2 px-2 py-1 bg-gray-200 rounded"
              >
                {tagName}
              </span>
            ));
          })()}
        </div>
      ) : (
        <p className="text-text-main">Belum ada tags untuk dokumen ini.</p>
      )}

      <h2 className="text-3xl font-bold mb-6 mt-8">Pengetahuan Arsip</h2>
      {document.annotations && document.annotations.length > 0 ? (
        <div className="space-y-6">
          {document.annotations.map((annotation, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <h3 className="text-xl font-semibold mb-2">
                {index + 1}. {annotation.selectedText}
              </h3>
              <p className="text-text-main text-sm mb-1">
                Deskripsi: {annotation.description}
              </p>
              <p className="text-text-light text-sm mb-1">
                Dibuat pada {formatDate(annotation.createdAt)}
              </p>
              {annotation.tags.length > 0 && (
                <div className="flex flex-wrap items-center text-text-light text-sm mb-1">
                  <span className="mr-2">Tags:</span>
                  {annotation.tags.map((tag) => (
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

export default DetailArsipPage;
