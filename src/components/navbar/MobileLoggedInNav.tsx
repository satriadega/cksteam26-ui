import React from "react";
import type { NavbarLoggedInProps } from "../../types/navbar";
import { Link } from "react-router-dom";

interface MobileLoggedInNavProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  onLogout: () => void;
}

const MobileLoggedInNav: React.FC<MobileLoggedInNavProps> = ({ mobileMenuOpen, toggleMobileMenu, onLogout }) => {
  return (
    <div className="md:hidden bg-link-nav fixed top-0 left-0 w-full h-screen z-50">
      <div className="flex flex-col items-center space-y-4 p-4">
        <button onClick={toggleMobileMenu} className="text-white focus:outline-none self-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <Link
          to="/buat-arsip"
          className="text-white hover:text-text-main"
          onClick={toggleMobileMenu}
        >
          Buat arsip
        </Link>
        <Link
          to="/arsip"
          className="text-white hover:text-text-main"
          onClick={toggleMobileMenu}
        >
          List arsip
        </Link>
        <Link
          to="/dashboard"
          className="text-white hover:text-text-main"
          onClick={toggleMobileMenu}
        >
          Dashboard
        </Link>
        <Link
          to="/profile"
          className="text-white hover:text-text-main"
          onClick={toggleMobileMenu}
        >
          Profile
        </Link>
        <button
          onClick={onLogout}
          className="text-white hover:text-text-main"
        >
          Keluar
        </button>
      </div>
    </div>
  );
};

export default MobileLoggedInNav;
