import React from "react";
import type { NavbarLoggedOutProps } from "../../types/navbar";
import { Link } from 'react-router-dom';

const LoggedOutNav: React.FC<NavbarLoggedOutProps> = () => {
  return (
    <nav className="bg-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <a href="/" className="text-xl font-bold text-black">
          Arsipku
        </a>
      </div>
      <div className="flex items-center">
        <Link to="/register" className="text-gray-600 hover:text-black mr-4">
          Daftar
        </Link>
        <Link to="/login" className="bg-gray-200 hover:bg-gray-300 text-text-main font-bold py-2 px-4 rounded">
          Masuk
        </Link>
      </div>
    </nav>
  );
};

export default LoggedOutNav;
