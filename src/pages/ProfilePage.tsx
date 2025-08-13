import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../api";
import type { Profile } from "../types/profile";
import { useDispatch } from "react-redux";
import { showModal, hideModal } from "../store/modalSlice";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [statusNotification, setStatusNotification] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      dispatch(showModal({ type: "loading", message: "Loading profile..." }));
      try {
        const response = await getProfile();
        const profileData: Profile = response.data.data[0];
        setName(profileData.name);
        setStatusNotification(profileData.statusNotification);
      } catch (err) {
        setError("Failed to fetch profile data.");
        console.error(err);
        dispatch(
          showModal({ type: "error", message: "Failed to fetch profile data." })
        );
      } finally {
        dispatch(hideModal());
      }
    };

    fetchProfile();
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showModal({ type: "loading", message: "Updating profile..." }));
    setError(null);

    try {
      const data: {
        name: string;
        password?: string;
        statusNotification: boolean;
      } = {
        name,
        statusNotification,
      };
      if (password) {
        data.password = password;
      }
      await updateProfile(data);
      dispatch(
        showModal({ type: "success", message: "Profile updated successfully!" })
      );
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
      dispatch(
        showModal({ type: "error", message: "Failed to update profile." })
      );
    } finally {
      // The modal will be hidden by the user after they acknowledge the success/error message
    }
  };

  const handleDeleteProfile = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      return;
    }

    dispatch(showModal({ type: "loading", message: "Deleting profile..." }));
    setError(null);

    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await fetch("http://192.168.0.104:8081/profile", {
        method: "DELETE",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`, // Use the dynamically retrieved token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete profile.");
      }

      localStorage.removeItem("token"); // Clear token on successful deletion
      dispatch(
        showModal({ type: "success", message: "Profile deleted successfully!" })
      );
      navigate("/login"); // Redirect to login page after deletion
    } catch (err) {
      let errorMessage = "Failed to delete profile.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
      console.error(err);
      dispatch(showModal({ type: "error", message: errorMessage }));
    } finally {
      // The modal will be hidden by the user after they acknowledge the success/error message
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ubah Akun</h1>
      <form className="max-w-md" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password (Kosongkan jika tidak ingin mengubah)
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="statusNotification"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Terima Notifikasi
          </label>
          <div className="relative">
            <select
              id="statusNotification"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={statusNotification ? "Ya" : "Tidak"}
              onChange={(e) => setStatusNotification(e.target.value === "Ya")}
            >
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start space-x-4">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Simpan
          </button>
          <button
            type="button" // Changed to type="button" to prevent form submission
            onClick={handleDeleteProfile}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Hapus Akun
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
