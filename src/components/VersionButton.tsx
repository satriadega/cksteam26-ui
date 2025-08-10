import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedDocuments } from "../api";
import type { Version } from "../types/document";
import { useDispatch } from "react-redux";
import { showModal } from "../store/modalSlice";

interface VersionButtonProps {
  document: {
    id: number;
    referenceDocumentId: number | null;
  };
}

const VersionButton: React.FC<VersionButtonProps> = ({ document }) => {
  const dispatch = useDispatch();
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const handleShowVersions = async () => {
    if (document && document.referenceDocumentId) {
      try {
        const response = await getRelatedDocuments(
          document.referenceDocumentId
        );
        if (response.data.data.length === 0) {
          dispatch(
            showModal({
              type: "info",
              message: "Belum ada versi lain.",
            })
          );
        } else {
          setVersions(response.data.data);
          setShowVersions(!showVersions);
        }
      } catch (error) {
        console.error("Error fetching related documents:", error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShowVersions}
        className="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-button-highlight-blue text-sm"
      >
        Lihat Versi
      </button>
      {showVersions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <ul>
            {versions.map((version) => (
              <li
                key={version.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-normal"
              >
                <Link to={`/arsip/${version.id}`}>
                  Version {version.version}.{version.subversion || 0}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VersionButton;
