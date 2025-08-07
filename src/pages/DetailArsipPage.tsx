import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById, getRelatedDocuments } from "../api";
import type { Document, RelatedDocument } from "../types/document";

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
  const [document, setDocument] = useState<Document | null>(null);
  const [relatedKnowledge, setRelatedKnowledge] = useState<RelatedDocument[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const documentId = parseInt(id, 10);
          const docResponse = await getDocumentById(documentId);
          setDocument(docResponse.data.data);

          const relatedResponse = await getRelatedDocuments(documentId);
          setRelatedKnowledge(relatedResponse.data.data);
        } catch (error) {
          console.error("Error fetching document or related documents:", error);
        }
      }
    };

    fetchData();
  }, [id]);

  if (!document) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-4 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
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
          <p className="text-text-main text-sm mb-2">Version 1.0</p>
          <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
            Tambahkan Versi
          </button>
        </div>
      </div>

      <div className="mb-6">
        {document.content.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-2 text-text-main whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mb-6">
        {document.tags && document.tags.length > 0 ? (
          <p className="text-text-light text-sm">
            Tags: {document.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        ) : (
          <p className="text-text-light text-sm">
            Tidak ada tags untuk saat ini.
          </p>
        )}
      </div>

      <div className="flex space-x-4 mb-8">
        <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
          Tambahkan Pengetahuan
        </button>
        <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
          Edit Artikel
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6">Pengetahuan Arsip</h2>
      {relatedKnowledge && relatedKnowledge.length > 0 ? (
        <div className="space-y-6">
          {relatedKnowledge.map((item, index) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0">
              <h3 className="text-xl font-semibold mb-2">
                {index + 1}. {item.title}
              </h3>
              <p className="text-text-main text-sm mb-1">
                Description: {item.description}
              </p>
              <p className="text-text-light text-sm mb-1">
                Tags: {item.tags.join(" ")}
              </p>
              <p className="text-text-light text-sm">
                Diverifikasi oleh {item.verifiedBy}
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
