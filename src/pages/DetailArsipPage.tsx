import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getDocumentById, getProfile } from "../api";
import type { Document } from "../types/document";
import { showModal, hideModal } from "../store/modalSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return "Hari ini";
  } else {
    return `${diffDays} hari yang lalu`;
  }
};

const DetailArsipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [document, setDocument] = useState<Document | null>(null);
  const [userProfile, setUserProfile] = useState({ username: "" });
  const { isAuthenticated, username: reduxUsername } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    console.log(
      "DetailArsipPage - isAuthenticated from Redux:",
      isAuthenticated
    );
    console.log("DetailArsipPage - Redux username:", reduxUsername);

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
                profileResponse.data.data[0].username || ""; // Ensure username is not null/undefined
              setUserProfile({ username: fetchedUsername });
              console.log("DetailArsipPage - userProfile after fetch:", {
                username: fetchedUsername,
              });
            } else {
              console.warn("DetailArsipPage - No user profile data found.");
              setUserProfile({ username: "" }); // Reset to default if no data
            }
          } else {
            console.log(
              "DetailArsipPage - User not authenticated, skipping profile fetch."
            );
          }

          dispatch(hideModal());
        } catch (error) {
          console.error("Error fetching document or related documents:", error);
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
  }, [id, dispatch, isAuthenticated, reduxUsername]); // Add reduxUsername to dependencies

  useEffect(() => {
    console.log("DetailArsipPage - Current userProfile state:", userProfile);
    if (document) {
      console.log("DetailArsipPage - Document username:", document.username);
      console.log(
        "DetailArsipPage - Comparison:",
        userProfile.username === document.username
      );
    }
  }, [userProfile, document]);

  if (!document) {
    return null;
  }

  console.log(
    "Render check:",
    isAuthenticated,
    userProfile.username,
    document.username
  );

  return (
    <div className="container mx-auto p-4 mt-8 mb-8 border rounded-lg">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold mb-2 border-b-2 border-black inline-block">
          {document.title}
        </h1>
        <p className="text-text-light text-sm">
          {document.name}
          <br />
          Dipublish {formatDate(document.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-text-main text-sm mb-2">
          Version {document.version + 1}.{document.subversion}
        </p>
        <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
          Lihat Versi
        </button>
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
              <Link to={`/tambah-pengetahuan?documentId=${id}`}>
                <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                  Tambahkan Pengetahuan
                </button>
              </Link>
              <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                Edit Artikel
              </button>
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
            console.log("DetailArsipPage - All raw tags:", allTags.map(tag => tag.tagName)); // Log raw tag names

            const uniqueTagsMap = new Map<string, string>(); // Map: lowercaseTagName -> originalTagName
            allTags.forEach(tag => {
              const lowerCaseTagName = tag.tagName.toLowerCase();
              if (!uniqueTagsMap.has(lowerCaseTagName)) {
                uniqueTagsMap.set(lowerCaseTagName, tag.tagName);
              }
            });
            const uniqueTagNamesToDisplay = Array.from(uniqueTagsMap.values());
            console.log("DetailArsipPage - Unique Tag Names to Display (after deduplication):", uniqueTagNamesToDisplay);
            return uniqueTagNamesToDisplay.map((tagName) => (
              <span key={tagName} className="inline-block mr-2 px-2 py-1 bg-gray-200 rounded">
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
                Description: {annotation.description}
              </p>
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
              <p className="text-text-light text-sm">
                Diverifikasi oleh {annotation.ownerUserId}
              </p>
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
