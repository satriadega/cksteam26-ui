import React from 'react';
import type { NavbarLoggedInProps } from '../../types/navbar';
import { Link } from 'react-router-dom';

const LoggedInNav: React.FC<NavbarLoggedInProps> = ({ onLogout }) => {
  return (
    <nav className="bg-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-xl font-bold text-black">
          Dashboard
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.197m0 0a6.002 6.002 0 00-5 5.197v3.158a2.039 2.039 0 01-1.406 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Account Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <button
          onClick={onLogout}
          className="bg-gray-200 hover:bg-gray-300 text-text-main font-bold py-2 px-4 rounded"
        >
          Keluar
        </button>
      </div>
    </nav>
  );
};

export default LoggedInNav;
