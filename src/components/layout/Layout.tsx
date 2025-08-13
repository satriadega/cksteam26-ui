import React from "react";
import { Outlet, useNavigate, useLocation, matchPath } from "react-router-dom";
import { LoggedInNav, LoggedOutNav } from "../navbar";
import { isAuthenticated } from "../../utils/auth";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/userSlice";
import type { RootState } from "../../store";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authPaths = ["/login", "/register", "/verify-registration"];
  const knownPaths = [
    "/",
    ...authPaths,
    "/dashboard",
    "/verify-registration",
    "/arsip",
    "/arsip/*",
    "/profile",
    "/buat-arsip",
    "/tambah-pengetahuan",
    "/buat-organisasi",
    "/perbarui-organisasi",
    "/list-appliance",
    "/list-verifier",
    "/verify-pengetahuan/*",
  ];
  const isKnownPath = knownPaths.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  const showNavbar = isKnownPath && !authPaths.includes(location.pathname);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const username = useSelector((state: RootState) => state.user.username);

  return (
    <div>
      {showNavbar &&
        (isAuthenticated() ? (
          <LoggedInNav username={username || ""} onLogout={handleLogout} />
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
