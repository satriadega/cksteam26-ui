import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createDocument, getDocumentById } from "../api";
import { showModal } from "../store/modalSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Document } from "../types/document";

const BuatArsipPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const documentIdParam = searchParams.get("documentId");
  const documentId = documentIdParam ? Number(documentIdParam) : null;

  const [version, setVersion] = useState<number>(1);
  const [subversion, setSubversion] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("Publik");
  const [content, setContent] = useState<string>("");

  const [referenceDocumentId, setReferenceDocumentId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (documentId) {
      getDocumentById(documentId).then((res) => {
        const doc = res.data;
        setTitle(doc.title);
        setContent(doc.content);
        setVersion(doc.version || 0);
        setSubversion(doc.subversion || 0);
        setReferenceDocumentId(doc.referenceDocumentId ?? null);
        if (doc.publicVisibility && !doc.isPrivate) setVisibility("Publik");
        else if (!doc.publicVisibility && doc.isPrivate)
          setVisibility("Pribadi");
        else setVisibility("Organisasi");
      });
    }
  }, [documentId]);

  const mapVisibility = (value: string) => {
    if (value === "Publik") return { publicVisibility: true, private: false };
    if (value === "Pribadi") return { publicVisibility: false, private: true };
    return { publicVisibility: false, private: false };
  };

  const handleCreateMajorVersion = async () => {
    const newVersion = version + 1;
    setVersion(newVersion);
    await new Promise((resolve) => setTimeout(resolve, 0));
    handlePublish(newVersion, 0);
  };

  const handleCreateMinorVersion = async () => {
    const newSubversion = subversion + 1;
    setSubversion(newSubversion);
    await new Promise((resolve) => setTimeout(resolve, 0));
    handlePublish(version, newSubversion);
  };

  const handlePublish = async (ver = version, subver = subversion) => {
    if (title && content) {
      const { publicVisibility, private: isPrivate } =
        mapVisibility(visibility);
      const document: Document = {
        id: 0,
        name: "",
        createdAt: "",
        tags: null,
        annotationCount: null,
        annotations: null,
        username: "",
        isAnnotable: false,
        isVerifiedAll: false,
        title,
        content,
        publicVisibility,
        referenceDocumentId,
        version: ver,
        subversion: subver,
        private: isPrivate,
      };
      const res = await createDocument(document);
      if (res && res.data && res.data.documentId) {
        dispatch(
          showModal({
            type: "success",
            message: "Document published successfully!",
          })
        );
        navigate(`/tambah-pengetahuan?documentId=${res.data.documentId}`);
      } else {
        dispatch(
          showModal({
            type: "error",
            message: "Failed to get new document ID!",
          })
        );
      }
    } else {
      dispatch(
        showModal({ type: "error", message: "Title and content are required!" })
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
          if (e.key === "Enter") handlePublish();
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

      {documentId ? (
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={handleCreateMajorVersion}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Buat Versi Major
          </button>
          <button
            onClick={handleCreateMinorVersion}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Buat Versi Minor
          </button>
        </div>
      ) : (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => handlePublish()}
            className="bg-accent hover:bg-button-highlight-blue text-white font-bold py-2 px-4 rounded"
          >
            Publikasikan
          </button>
        </div>
      )}
    </div>
  );
};

export default BuatArsipPage;
