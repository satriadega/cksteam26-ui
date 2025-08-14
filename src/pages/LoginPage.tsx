import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showModal } from "../store/modalSlice";
import { setUser } from "../store/userSlice";
import { API_URL } from "../api";

interface ErrorType {
  [key: string]: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErrorType>({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(
          showModal({
            type: "success",
            message: data.message || "Login berhasil!",
          })
        );
        localStorage.setItem("token", data.data.token);
        dispatch(setUser({ username: data.data.username })); // Dispatch setUser with the actual username
        navigate("/dashboard");
      } else {
        if (data.data && Array.isArray(data.data)) {
          const newErrors: ErrorType = {};
          data.data.forEach((err: { field: string; message: string }) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        } else {
          dispatch(
            showModal({
              type: "error",
              message: data.message || "Login gagal. Silakan coba lagi.",
            })
          );
        }
      }
    } catch (error) {
      dispatch(
        showModal({
          type: "error",
          message: "Terjadi kesalahan saat login.",
        })
      );
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="absolute top-4 left-4">
        <a href="/" className="text-accent hover:underline text-lg font-medium">
          Home
        </a>
      </div>
      <h1 className="text-4xl font-bold mb-8">
        <a href="/" className="text-accent hover:underline">
          Arsipku
        </a>
      </h1>
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl   rounded-lg w-96">
        <h3 className="text-2xl font-bold text-center mb-6">Masuk</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500"
                    : "border-link-nav focus:ring-link-nav"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="password">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-link-nav focus:ring-link-nav"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="showPassword"
                className="mr-2"
                checked={showPassword}
                onChange={togglePasswordVisibility}
              />
              <label htmlFor="showPassword" className="text-sm">
                Tampilkan password
              </label>
            </div>
            <div className="flex items-baseline justify-center">
              <button
                type="submit"
                className="w-full px-6 py-2 text-white bg-link-nav rounded-md hover:bg-button-highlight-blue focus:outline-none focus:bg-button-highlight-blue"
              >
                Masuk
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg font-medium mb-4">Belum Punya Akun?</p>
              <a
                href="/register"
                className="block w-full px-6 py-2 text-white bg-link-nav rounded-md hover:bg-button-highlight-blue focus:outline-none focus:bg-button-highlight-blue mb-2 text-center"
              >
                Register
              </a>
              <button className="w-full px-6 py-2 text-white bg-link-nav rounded-md hover:bg-button-highlight-blue focus:outline-none focus:bg-button-highlight-blue">
                Lupa Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
