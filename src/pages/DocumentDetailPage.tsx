import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocumentById } from '../api';
import type { Document } from '../types/document';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        try {
          const documentId = parseInt(id, 10);
          const response = await getDocumentById(documentId);
          setDocument(response.data.data);
        } catch (error) {
          console.error('Error fetching document:', error);
        }
      }
    };

    fetchDocument();
  }, [id]);

  if (!document) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 bg-primary">
      <h1 className="text-2xl font-bold mb-4 text-title">{document.title}</h1>
      <p className="text-text-main">{document.content}</p>
      <button className="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-button-highlight-blue">
        Lihat Versi
      </button>
    </div>
  );
};

export default DocumentDetailPage;
