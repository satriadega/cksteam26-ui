import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import { useDispatch } from "react-redux";
import { showModal } from "../store/modalSlice";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const response = await fetch(
        `${API_URL}/auth/registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, name, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(
          showModal({
            type: "success",
            message:
              data.message ||
              "Pendaftaran berhasil! Silakan verifikasi email Anda.",
            onConfirm: () =>
              navigate("/verify-registration", {
                state: { email: data.data.email, otp: data.data.otp },
              }),
          })
        );
      } else {
        // Handle specific field errors from the API response
        if (data.data && Array.isArray(data.data)) {
          const newErrors: { [key: string]: string } = {};
          data.data.forEach((err: { field: string; message: string }) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        } else {
          // Handle general error message from API
          dispatch(
            showModal({
              type: "error",
              message: data.message || "Pendaftaran gagal. Silakan coba lagi.",
            })
          );
        }
      }
    } catch (error) {
      dispatch(
        showModal({
          type: "error",
          message: "Terjadi kesalahan saat pendaftaran.",
        })
      );
      console.error("Error registering:", error);
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
      <div className="px-8 py-6 mt-4 text-left bg-inherit shadow-2xl rounded-lg w-96">
        <h3 className="text-2xl font-bold text-center mb-6">Daftar</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="username">
                Nama Pengguna
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nama Pengguna"
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
              <label className="block text-lg font-medium" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-link-nav focus:ring-link-nav"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-link-nav focus:ring-link-nav"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="password">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
                Daftar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
