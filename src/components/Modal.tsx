// components/Modal.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideModal } from "../store/modalSlice";
import { FaSpinner } from "react-icons/fa";
import type { RootState } from "../store";

const Modal: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, type, message, onConfirm, onCancel } = useSelector(
    (state: RootState) => state.modal
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    dispatch(hideModal());
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    dispatch(hideModal());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {type === "loading" ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-white" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2
            className={`text-xl font-bold mb-4 ${
              type === "success"
                ? "text-green-600"
                : type === "error"
                ? "text-red-600"
                : "text-gray-800"
            }`}
          >
            {type === "success"
              ? "Sukses"
              : type === "error"
              ? "Error"
              : "Konfirmasi"}
          </h2>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            {(type === "confirm" || onCancel) && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Batal
              </button>
            )}
            {(type === "confirm" || onConfirm) && (
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 ${
                  type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded`}
              >
                OK
              </button>
            )}
            {!onConfirm && !onCancel && type !== "confirm" && (
              <button
                onClick={() => dispatch(hideModal())}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
