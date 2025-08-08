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
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

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
            setUserProfile(profileResponse.data);
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
  }, [id, dispatch, isAuthenticated]);

  if (!document) {
    return null;
  }

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
          Tambahkan Versi
        </button>
      </div>

      <div className="mb-6 text-xl text-left">
        {document.content.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-2 text-text-main whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex space-x-4 mb-8">
        {isAuthenticated && userProfile.username === document.username ? (
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
        )}
      </div>

      <h2 className="text-3xl font-bold mb-6">Tags</h2>
      {document.annotations &&
      document.annotations.flatMap((a) => a.tags).length > 0 ? (
        <div className="flex flex-wrap">
          {document.annotations
            .flatMap((a) => a.tags)
            .map((tag) => (
              <span key={tag.id} className="ml-2 px-2 py-1 bg-gray-200 rounded">
                {tag.tagName}
              </span>
            ))}
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
                  <span key={tag.id} className="ml-2 px-2 py-1 bg-gray-200 rounded">
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
