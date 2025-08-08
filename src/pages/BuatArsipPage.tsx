import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createDocument } from "../api";
import { showModal } from "../store/modalSlice";

const BuatArsipPage: React.FC = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("Publik");
  const [content, setContent] = useState("");

  const handlePublish = async () => {
    let publicVisibility = false;
    let isPrivate = false;

    if (visibility === "Publik") {
      publicVisibility = true;
      isPrivate = false;
    } else if (visibility === "Pribadi") {
      publicVisibility = false;
      isPrivate = true;
    } else if (visibility === "Organisasi") {
      publicVisibility = false;
      isPrivate = false;
    }

    const documentData = {
      title,
      content,
      publicVisibility,
      referenceDocumentId: null,
      version: 0,
      subversion: 0,
      private: isPrivate,
    };

    try {
      const response = await createDocument(documentData);
      const documentId = response.data.documentId;
      dispatch(
        showModal({
          type: "success",
          message: `Arsip berhasil dibuat!`,
          onConfirm: () => {
            window.location.href = `/tambah-pengetahuan?documentId=${documentId}`;
          },
        })
      );
    } catch (error) {
      console.error("Gagal membuat arsip:", error);
      dispatch(
        showModal({
          type: "error",
          message: "Gagal membuat arsip. Silakan coba lagi.",
        })
      );
    }
  };

  return (
    <div className="container mx-auto p-4 mt-4">
      <input
        type="text"
        placeholder="Judul Arsip"
        className="text-4xl font-bold mb-4 w-full border-none focus:outline-none bg-transparent h-20"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handlePublish();
          }
        }}
      />

      <div className="flex items-center space-x-4 mb-6">
        <select
          className="p-2 border rounded-md bg-white text-text-main pr-4"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="Publik">Publik</option>
          <option value="Pribadi">Pribadi</option>
          <option value="Organisasi">Organisasi</option>
        </select>
      </div>

      <textarea
        className="w-full h-96 p-4 border rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Tulis konten arsip Anda di sini..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handlePublish}
          className="bg-accent hover:bg-button-highlight-blue text-white font-bold py-2 px-4 rounded"
        >
          Publikasikan
        </button>
      </div>
    </div>
  );
};

export default BuatArsipPage;
