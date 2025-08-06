import React, { useState, useEffect } from 'react';
import { getDocuments } from '../api';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../types/document';

const HomePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getDocuments();
        setDocuments(response.data.data.content);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-title">
        Welcome to the Home Page
      </h1>
      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <button onClick={() => navigate(`/arsip/${document.id}`)} className="text-link-nav hover:underline">
              {document.title}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/arsip')} className="text-link-nav hover:underline mt-4">
        Go to Arsip
      </button>
    </div>
  );
};

export default HomePage;
