import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { hideModal } from "../store/modalSlice";
import { FaSpinner } from "react-icons/fa";

const Modal: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, type, message, onConfirm, onCancel } = useSelector(
    (state: RootState) => state.modal
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    dispatch(hideModal());
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    dispatch(hideModal());
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {type === "loading" ? (
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
        ) : (
          <>
            <h2
              className={`text-xl font-bold mb-4 ${
                type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {type === "success" ? "Sukses" : "Error"}
            </h2>
            <p className="mb-6">{message}</p>
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              )}
              {onConfirm && (
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 ${
                    type === "success" ? "bg-green-600" : "bg-red-600"
                  } text-white rounded hover:${
                    type === "success" ? "bg-green-700" : "bg-red-700"
                  }`}
                >
                  OK
                </button>
              )}
              {!onConfirm && !onCancel && (
                <button
                  onClick={() => dispatch(hideModal())}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Tutup
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
