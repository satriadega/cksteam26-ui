import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showModal } from "../store/modalSlice";
import { useNavigate } from "react-router-dom";

interface Appliance {
  documentId: number;
  createdAt: string;
  username: string;
  name: string;
  email: string;
  accepted: boolean;
  fullname: string;
}

const ListAppliancePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-indexed pages
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10; // As per the API call size=10

  const getBearerToken = () => {
    return localStorage.getItem("token");
  };

  const fetchAppliances = async () => {
    setLoading(true);
    setError(null);
    const bearerToken = getBearerToken();

    if (!bearerToken) {
      dispatch(
        showModal({
          type: "error",
          message: "Authentication token not found. Please log in.",
          onConfirm: () => navigate("/login"),
        })
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.0.104:8081/appliance?page=${currentPage}&size=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Check for specific "data not found" message from the backend
        // Assuming the backend sends a message like "Data not found" or "No content"
        if (
          errorData.message &&
          (errorData.message.toLowerCase().includes("not found") ||
            errorData.message.toLowerCase().includes("no content"))
        ) {
          setAppliances([]); // Set to empty array
          setTotalPages(1); // Reset total pages
          setLoading(false); // Stop loading
          setError(null); // Clear any previous error
          return; // Exit the function, no modal needed
        } else {
          // For other types of errors, throw to be caught and show modal
          throw new Error(
            errorData.message ||
              `Failed to fetch appliances with status: ${response.status}`
          );
        }
      }

      const result = await response.json();
      if (result.success) {
        if (result.data && result.data.content) {
          setAppliances(result.data.content);
          setTotalPages(result.data.total_pages);
        } else {
          // If success is true but data or content is empty/null, treat as no data found
          setAppliances([]);
          setTotalPages(1); // Reset total pages to 1 for empty data
        }
      } else {
        // If success is false, it's an actual error from the API
        throw new Error(
          result.message || "Unexpected API response structure or error"
        );
      }
    } catch (err: unknown) {
      let errorMessage = "Terjadi kesalahan saat mengambil data.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Show modal only for actual errors, not for "data not found" which is handled above
      setError(errorMessage);
      dispatch(
        showModal({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAccept = async (
    documentId: number,
    username: string,
    isAccepted: boolean
  ) => {
    const bearerToken = getBearerToken();
    if (!bearerToken) {
      dispatch(
        showModal({
          type: "error",
          message: "Authentication token not found. Please log in.",
          onConfirm: () => navigate("/login"),
        })
      );
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.0.104:8081/appliance/${documentId}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAccepted, username }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update appliance ${documentId}`
        );
      }

      dispatch(
        showModal({
          type: "success",
          message: `Appliance ${documentId} updated successfully!`,
          onConfirm: () => fetchAppliances(),
        })
      );
    } catch (err: unknown) {
      let errorMessage = "Terjadi kesalahan saat memperbarui data.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      dispatch(showModal({ type: "error", message: errorMessage }));
    }
  };

  const handleViewProfile = (username: string) => {
    navigate(`/profile/${username}`); // Assuming a profile route exists
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white pt-8">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl rounded-lg w-full max-w-4xl">
        <h3 className="text-2xl font-bold text-center mb-6">
          List Arsip Pendaftaran Verifier
        </h3>
        {loading && <p className="text-center">Loading appliances...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && appliances.length === 0 && (
          <p className="text-center">Belum ada user appliance.</p>
        )}
        {!loading && !error && appliances.length > 0 && (
          <>
            <ul className="space-y-4">
              {appliances.map((appliance) => (
                <li
                  key={appliance.documentId}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex-1">
                    <p className="text-lg">
                      <span className="font-semibold">{appliance.email}</span> /{" "}
                      {appliance.fullname} ingin menjadi verifier di Arsip "
                      <a
                        href={`/arsip/${appliance.documentId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {appliance.name}
                      </a>
                      "
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-col gap-2 md:flex-row">
                    <button
                      onClick={() =>
                        handleAccept(
                          appliance.documentId,
                          appliance.username,
                          true
                        )
                      }
                      className="ml-2 px-6 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() =>
                        handleAccept(
                          appliance.documentId,
                          appliance.username,
                          false
                        )
                      }
                      className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-700"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleViewProfile(appliance.username)}
                      className="px-6 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                    >
                      Lihat Profil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                {"<"}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-1 border border-gray-300 rounded-md ${
                    currentPage === i
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                {">"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListAppliancePage;
