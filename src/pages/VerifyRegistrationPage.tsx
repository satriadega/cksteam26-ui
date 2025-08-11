import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showModal } from "../store/modalSlice";

const VerifyRegistrationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { email, otp } = location.state || { email: "", otp: undefined };
  const [token, setToken] = useState("");

  if (!otp) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="absolute top-4 left-4">
          <a
            href="/"
            className="text-accent hover:underline text-lg font-medium"
          >
            Home
          </a>
        </div>
        <h1 className="text-4xl font-bold mb-8">
          <a href="/" className="text-accent hover:underline">
            Arsipku
          </a>
        </h1>
        <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl rounded-lg w-96">
          <h3 className="text-2xl font-bold text-center mb-6 text-red-500">
            Error
          </h3>
          <p className="text-lg text-center">
            OTP tidak ditemukan. Silakan kembali ke halaman register dan coba
            lagi.
          </p>
          <div className="flex items-baseline justify-center mt-4">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 text-white bg-link-nav rounded-md hover:bg-button-highlight-blue focus:outline-none focus:bg-button-highlight-blue"
            >
              Kembali ke Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://192.168.0.104:8081/auth/verify-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(
          showModal({
            type: "success",
            message: data.message || "Verifikasi berhasil!",
            onConfirm: () => navigate("/login"),
          })
        );
      } else {
        dispatch(
          showModal({
            type: "error",
            message: data.message || "Verifikasi gagal. Silakan coba lagi.",
          })
        );
      }
    } catch (error) {
      dispatch(
        showModal({
          type: "error",
          message: "Terjadi kesalahan saat verifikasi.",
        })
      );
      console.error("Error verifying registration:", error);
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
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl rounded-lg w-96">
        <h3 className="text-2xl font-bold text-center mb-6">
          Verifikasi Pendaftaran
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium" htmlFor="otp">
                Kode OTP
              </label>
              <input
                type="text"
                id="otp"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan kode OTP"
                className="w-full px-4 py-2 mt-2 border border-link-nav rounded-md focus:outline-none focus:ring-1 focus:ring-link-nav"
              />
            </div>
            {otp && (
              <div className="mb-4 text-center text-green-600">
                <p>OTP: {otp}</p>
              </div>
            )}
            <div className="flex items-baseline justify-center">
              <button
                type="submit"
                className="w-full px-6 py-2 text-white bg-link-nav rounded-md hover:bg-button-highlight-blue focus:outline-none focus:bg-button-highlight-blue"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyRegistrationPage;
