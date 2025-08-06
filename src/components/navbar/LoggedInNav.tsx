import React, { useState, useRef, useEffect } from "react";
import type { NavbarLoggedInProps } from "../../types/navbar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm } from "../../store/searchSlice";
import type { RootState } from "../../store";

const LoggedInNav: React.FC<NavbarLoggedInProps> = ({ onLogout }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="flex items-center space-x-4 gap-8">
          <a href="/" className="text-3xl font-bold text-title">
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
            style={{ marginLeft: "-20px" }}
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

        <div className="flex items-center gap-8 relative" ref={dropdownRef}>
          <Link
            to="/buat-arsip"
            className="text-white hover:text-text-main mr-4"
          >
            Buat arsip
          </Link>
          <Link
            to="/arsip"
            className="text-white hover:text-text-main mr-4"
            onClick={handleClearSearch}
          >
            List arsip
          </Link>
          <Link
            to="/dashboard"
            className="text-white hover:text-text-main mr-4"
          >
            Dashboard
          </Link>

          <div className="relative flex items-center">
            <div className="relative mr-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white cursor-pointer hover:text-accent transition-colors duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute bottom-4 left-4 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                3
              </span>
            </div>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-button-highlight-blue hover:bg-accent text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              Akun
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-20">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default LoggedInNav;
