import React from "react";
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      dispatch(setSearchTerm(inputValue));
      navigate("/arsip");
    }
  };

  const handleClearSearch = () => {
    dispatch(setSearchTerm(""));
  };

  return (
    <div className="sticky top-0 z-10 shadow-md">
      <nav className="bg-link-nav p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-xl font-bold text-title">
            Dashboard
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari"
              className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-text-light"
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
            className="h-6 w-6 text-text-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847 .655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <button
            onClick={onLogout}
            className="bg-button-highlight-blue hover:bg-accent text-white font-bold py-2 px-4 rounded"
          >
            Keluar
          </button>
        </div>
      </nav>
    </div>
  );
};

export default LoggedInNav;
