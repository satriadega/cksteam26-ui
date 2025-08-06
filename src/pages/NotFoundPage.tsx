import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-blue-600 hover:underline text-lg font-medium">Home</Link>
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-lg mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
    </div>
  );
};

export default NotFoundPage;
