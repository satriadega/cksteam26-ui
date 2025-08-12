import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getDocumentById,
  getProfile,
  getRelatedDocuments,
  registerAsVerifier,
  getApplianceStatus,
} from "../api";
import type { Document, Version } from "../types/document";
import { showModal, hideModal } from "../store/modalSlice";
import { AxiosError } from "axios";
import type { RootState } from "../store";
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

const DetailArsipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [document, setDocument] = useState<Document | null>(null);
  const [userProfile, setUserProfile] = useState({ username: "" });
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [canRegisterAsVerifier, setCanRegisterAsVerifier] = useState(false);
  const [showAddKnowledgeButton, setShowAddKnowledgeButton] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const { isAuthenticated, username: reduxUsername } = useSelector(
    (state: RootState) => state.user
  );
  const versionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        dispatch(showModal({ type: "loading", message: "Memuat dokumen..." }));
        try {
          const documentId = parseInt(id, 10);
          const docResponse = await getDocumentById(documentId);
          setDocument(docResponse.data);

          // Fetch appliance status to determine both add knowledge and verifier button visibility
          const applianceResponse = await getApplianceStatus(documentId, true);
          if (
            applianceResponse.data &&
            applianceResponse.data.success &&
            applianceResponse.data.data
          ) {
            // Check for nested data
            console.log(applianceResponse.data.data.accepted, "hi ga");
            if (applianceResponse.data.data.accepted === false) {
              // Corrected access
              // User has applied but is pending acceptance
              setShowPendingMessage(true);
              setShowAddKnowledgeButton(false);
              setCanRegisterAsVerifier(false); // Cannot register again if pending
            } else {
              // User IS a verifier for this document (accepted: true or no 'accepted' field implies accepted)
              setShowAddKnowledgeButton(true);
              setCanRegisterAsVerifier(false); // User is already a verifier, cannot register
              setShowPendingMessage(false);
            }
          } else {
            // User is NOT a verifier for this document (success: false or no data)
            setShowAddKnowledgeButton(false);
            setCanRegisterAsVerifier(true); // User is not a verifier, can register
            setShowPendingMessage(false);
          }

          if (checkAuthStatus()) {
            // Use the imported isAuthenticated function
            try {
              const profileResponse = await getProfile();
              // console.log("User Profile:", profileResponse.data); // Debugging log removed
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
            } catch (profileError) {
              // If fetching profile fails (e.g., token expired),
              // don't redirect, just treat user as unauthenticated for this page's profile features.
              console.warn(
                "Failed to fetch profile in DetailArsipPage:",
                profileError
              );
              setUserProfile({ username: "" });
              // No need to show an error modal for profile fetch on a public page
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        versionsRef.current &&
        !versionsRef.current.contains(event.target as Node)
      ) {
        setShowVersions(false);
      }
    };

    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [versionsRef]);

  const handleShowVersions = async () => {
    if (!document || !document.referenceDocumentId) return;

    dispatch(showModal({ type: "loading", message: "Memuat versi..." }));

    try {
      const response = await getRelatedDocuments(document.referenceDocumentId);
      dispatch(hideModal());
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
      dispatch(hideModal());
      dispatch(
        showModal({
          type: "error",
          message: "Gagal memuat versi. Silakan coba lagi. " + error,
        })
      );
      setShowVersions(false);
    }
  };

  const handleVersionClick = (versionId: number) => {
    if (document && document.id === versionId) {
      setShowVersions(false);
    } else {
      dispatch(showModal({ type: "loading", message: "Memuat versi..." }));
      setShowVersions(false);
    }
  };

  const handleRegisterVerifier = async () => {
    if (id) {
      dispatch(
        showModal({
          type: "loading",
          message: "Mendaftarkan sebagai verifier...",
        })
      );
      try {
        if (document?.id) {
          await registerAsVerifier(parseInt(id, 10), true);
          dispatch(
            showModal({
              type: "success",
              message: "Berhasil mendaftar sebagai verifier.",
            })
          );
          setCanRegisterAsVerifier(false);
          setShowPendingMessage(true); // Show pending message after successful registration
        }
      } catch (error) {
        dispatch(
          showModal({
            type: "error",
            message:
              "Gagal mendaftar sebagai verifier. Silakan coba lagi. " + error,
          })
        );
      }
    }
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
          Version {document.version}.{document.subversion || 0}
        </p>
        <div className="relative inline-block" ref={versionsRef}>
          <button
            onClick={handleShowVersions}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
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
                      onClick={() => handleVersionClick(version.id)}
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
        className="mb-6 text-lg text-left user-select-text whitespace-pre-wrap mt-6 overflow-y-scroll h-[40vh] whitespace-nowrap"
        id="document-content"
      >
        {document.content}
      </div>

      <div className="flex space-x-4 mb-8">
        {isAuthenticated && (
          <>
            {document.isAnnotable && (
              <>
                {(showAddKnowledgeButton ||
                  userProfile.username === document.username) && (
                  <Link to={`/tambah-pengetahuan?documentId=${id}`}>
                    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                      Tambahkan Pengetahuan
                    </button>
                  </Link>
                )}
                {userProfile.username === document.username && (
                  <Link to={`/buat-arsip?documentId=${id}`}>
                    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                      Tambahkan Versi
                    </button>
                  </Link>
                )}
              </>
            )}
            {showPendingMessage && (
              <p className="text-center text-gray-600 font-semibold bg-yellow-400 p-2 rounded-sm">
                Aplikasi Verifier Sedang menunggu diterima
              </p>
            )}

            {canRegisterAsVerifier &&
              document.isAnnotable &&
              userProfile.username !== document.username && (
                <button
                  onClick={handleRegisterVerifier}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Daftar Menjadi Verifier
                </button>
              )}
          </>
        )}
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
