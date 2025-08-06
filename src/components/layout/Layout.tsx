import React from "react";
import { Outlet, useNavigate, useLocation, matchPath } from "react-router-dom";
import { LoggedInNav, LoggedOutNav } from "../navbar";
import { isAuthenticated, getUsernameFromToken } from "../../utils/auth";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const authPaths = ["/login", "/register", "/verify-registration"];
  const knownPaths = ["/", ...authPaths, "/dashboard", "/verify-registration"];
  const isKnownPath = knownPaths.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  const showNavbar = isKnownPath && !authPaths.includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const username = isAuthenticated() ? getUsernameFromToken() : "";

  return (
    <div>
      {showNavbar &&
        (isAuthenticated() ? (
          <LoggedInNav onLogout={handleLogout} username={username} />
        ) : (
          <LoggedOutNav onLogin={handleLogin} />
        ))}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
