import React, { useState, useRef, useEffect } from "react";
import type { NavbarLoggedInProps } from "../../types/navbar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm } from "../../store/searchSlice";
import type { RootState } from "../../store";
import { getProfile } from "../../api";

const LoggedInNav: React.FC<NavbarLoggedInProps> = ({ onLogout }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationType, setNotificationType] = useState(0); // Add new state for notification type
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await getProfile();
        setNotificationCount(response.data.data[0].notificationCounter);
        setNotificationType(response.data.data[0].notificationType); // Set notification type
      } catch (error) {
        console.error("Failed to fetch notification count or type:", error);
      }
    };

    fetchNotificationCount();

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationDropdownOpen(false);
      }
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
    setDropdownOpen(false);
    setNotificationDropdownOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSearch = () => {
    dispatch(setSearchTerm(inputValue));
    navigate("/arsip");
    toggleMobileMenu(); // Use toggleMobileMenu to ensure consistency
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setDropdownOpen(false);
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
          <div className="flex items-center space-x-8 mr-8">
            <Link to="/buat-arsip" className="text-white hover:text-text-main ">
              Buat arsip
            </Link>
            <Link
              to="/arsip"
              className="text-white hover:text-text-main "
              onClick={handleClearSearch}
            >
              List Arsip
            </Link>
            <Link to="/dashboard" className="text-white hover:text-text-main ">
              Dashboard
            </Link>

            <div className="relative flex items-center" ref={notificationRef}>
              <div className="relative mr-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[40px] w-[40px] text-white cursor-pointer hover:text-accent transition-colors duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute bottom-6 left-6 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                    {notificationCount}
                  </span>
                )}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-20">
                    <Link
                      to="/list-verifier"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => setNotificationDropdownOpen(false)}
                    >
                      List Verifier
                      {(notificationType === 2 || notificationType === 3) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm-1 4a1 1 0 102 0 1 1 0 00-2 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                    <Link
                      to="/list-appliance"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => setNotificationDropdownOpen(false)}
                    >
                      List Pendaftaran Verifier
                      {(notificationType === 1 || notificationType === 3) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm-1 4a1 1 0 102 0 1 1 0 00-2 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                  </div>
                )}
              </div>
              <div className="w-8"></div>
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
                    onClick={() => {
                      setDropdownOpen(false);
                      toggleMobileMenu();
                    }}
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
              <div className="relative mr-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[40px] w-[40px] text-white cursor-pointer hover:text-accent transition-colors duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {notificationCount > 0 && (
                  <span className="absolute bottom-6 left-6 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg z-[999]">
                    {notificationCount}
                  </span>
                )}
                {notificationDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-20">
                    <Link
                      to="/list-verifier"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => {
                        setNotificationDropdownOpen(false);
                        toggleMobileMenu();
                      }}
                    >
                      List Verifier
                      {(notificationType === 2 || notificationType === 3) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm-1 4a1 1 0 102 0 1 1 0 00-2 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                    <Link
                      to="/list-appliance"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => {
                        setNotificationDropdownOpen(false);
                        toggleMobileMenu();
                      }}
                    >
                      List Pendaftaran Verifier
                      {(notificationType === 1 || notificationType === 3) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm-1 4a1 1 0 102 0 1 1 0 00-2 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                  </div>
                )}
              </div>
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
              to="/dashboard"
              className="text-white hover:text-text-main"
              onClick={() => {
                toggleMobileMenu();
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/buat-arsip"
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
              to="/profile"
              className="text-white hover:text-text-main"
              onClick={() => {
                setDropdownOpen(false);
                toggleMobileMenu();
              }}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="text-white hover:text-text-main"
            >
              Keluar
            </button>
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
                className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
              onClick={() => {
                setMobileMenuOpen(false);
                handleSearch();
              }}
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

export default LoggedInNav;
