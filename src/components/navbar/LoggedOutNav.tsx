import React, { useState, useRef, useEffect } from "react";
import type { NavbarLoggedOutProps } from "../../types/navbar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm } from "../../store/searchSlice";
import type { RootState } from "../../store";

const LoggedOutNav: React.FC<NavbarLoggedOutProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSearch = () => {
    dispatch(setSearchTerm(inputValue));
    navigate("/arsip");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    dispatch(setSearchTerm(""));
  };

  return (
    <div className="sticky top-0 z-10 shadow-md">
      <nav className="bg-link-nav p-4 flex justify-between items-center relative">
        <div className="flex items-center xl:hidden">
          <a href="/" className="text-3xl font-bold text-title mr-4">
            Arsipku
          </a>
        </div>

        {/* Desktop menu */}
        <div className="hidden xl:flex items-center space-x-4 gap-8 justify-between w-full">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-3xl font-bold text-title mr-4">
              Arsipku
            </a>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari"
                className="w-full pl-3 pr-10 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              {inputValue && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={handleClearSearch}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="text-gray-400 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/register" className="text-white hover:text-text-main">
              Buat arsip
            </Link>
            <Link
              to="/arsip"
              className="text-white hover:text-text-main"
              onClick={handleClearSearch}
            >
              List arsip
            </Link>
            <Link
              to="/login"
              className="bg-button-highlight-blue hover:bg-accent text-white font-bold py-2 px-4 rounded"
            >
              Masuk
            </Link>
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="xl:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden bg-link-nav fixed top-0 left-0 w-full h-screen z-50"
          ref={mobileMenuRef}
        >
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex justify-between w-full">
              <a href="/" className="text-3xl font-bold text-title mr-4">
                Arsipku
              </a>
              <button
                onClick={toggleMobileMenu}
                className="text-white focus:outline-none self-start"
              >
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
            </div>

            <Link
              to="/register"
              className="text-white hover:text-text-main"
              onClick={() => {
                toggleMobileMenu();
              }}
            >
              Buat arsip
            </Link>
            <Link
              to="/arsip"
              className="text-white hover:text-text-main"
              onClick={() => {
                handleClearSearch();
                toggleMobileMenu();
              }}
            >
              List arsip
            </Link>
            <Link
              to="/login"
              className="bg-button-highlight-blue hover:bg-accent text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                toggleMobileMenu();
              }}
            >
              Masuk
            </Link>
          </div>
          <div className="flex justify-between absolute w-11/12 px-4 bottom-6">
            <input
              type="text"
              placeholder="Cari"
              className="w-full pl-3 pr-10 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            {inputValue && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={handleClearSearch}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              className="relative text-gray-400 hover:text-gray-700 left-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedOutNav;
