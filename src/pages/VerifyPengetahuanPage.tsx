import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showModal, hideModal } from "../store/modalSlice";
import {
  getAnnotationById,
  updateAnnotationStatus,
  getRelatedDocuments,
} from "../api";
import { AxiosError } from "axios";

interface Tag {
  id: number;
  tagName: string;
}

interface AnnotationData {
  id: number;
  documentId: number;
  documentName: string;
  username: string;
  fullName: string;
  isVerified: boolean;
  selectedText: string;
  startNo: number;
  endNo: number;
  description: string;
  tags: Tag[];
}

interface RelatedDocument {
  id: number;
  title: string;
  content: string;
}

const HighlightedContent: React.FC<{ text: string; start: number; end: number }> = ({ text, start, end }) => {
  if (start < 0 || end < 0 || start > text.length || end > text.length || start > end) {
    return <span>{text}</span>;
  }

  const before = text.substring(0, start);
  const highlighted = text.substring(start, end);
  const after = text.substring(end);

  return (
    <span>
      {before}
      <mark className="bg-yellow-300">{highlighted}</mark>
      {after}
    </span>
  );
};

const VerifyPengetahuanPage: React.FC = () => {
  const { annotationId } = useParams<{ annotationId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [annotation, setAnnotation] = useState<AnnotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([]);

  useEffect(() => {
    const fetchAnnotation = async () => {
      if (annotationId) {
        dispatch(showModal({ type: "loading", message: "Memuat data..." }));
        try {
          const response = await getAnnotationById(parseInt(annotationId));
          if (response.data.success) {
            setAnnotation(response.data.data);
            // Fetch related documents
            const relatedResponse = await getRelatedDocuments(
              response.data.data.documentId
            );
            if (relatedResponse.data.success) {
              setRelatedDocs(relatedResponse.data.data);
            }
            dispatch(hideModal());
          } else {
            setError(response.data.message);
          }
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.status === 404) {
            setError("Annotation not found.");
          } else {
            setError("An error occurred while fetching the annotation.");
          }
        } finally {
          dispatch(hideModal());
        }
      }
    };

    fetchAnnotation();
  }, [annotationId]);

  const handleAction = async (action: "accept" | "reject") => {
    if (annotationId) {
      dispatch(showModal({ type: "loading", message: "Memproses..." }));
      setIsVerifying(true);
      try {
        const response = await updateAnnotationStatus(parseInt(annotationId), action);
        if (response.data.success) {
          dispatch(hideModal());
          setAnnotation((prev) =>
            prev ? { ...prev, isVerified: action === 'accept' } : null
          );
          setTimeout(() => {
            navigate("/list-verifier");
          }, 1500);
        } else {
          dispatch(
            showModal({
              type: "error",
              message: response.data.message || "Aksi gagal",
            })
          );
        }
      } catch {
        dispatch(
          showModal({
            type: "error",
            message: "Terjadi kesalahan saat memproses.",
          })
        );
      } finally {
        setIsVerifying(false);
      }
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!annotation) {
    return <p className="text-center">Annotation data is not available.</p>;
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-white pt-8">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-2xl rounded-lg w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-center mb-6">
          Verify Pengetahuan
        </h3>
        <div className="space-y-4">
          <p>
            <strong>Pengetahuan dari:</strong> {annotation.fullName} (@
            {annotation.username})
          </p>
          <p>
            <strong>Dokumen:</strong>{" "}
            <a
              href={`/arsip/${annotation.documentId}`}
              className="text-blue-600 hover:underline"
            >
              {annotation.documentName}
            </a>
          </p>
          <p>
            <strong>Teks yang Dipilih:</strong> "{annotation.selectedText}"
          </p>
          <p>
            <strong>Deskripsi:</strong> {annotation.description}
          </p>
          <p>
            <strong>Tags:</strong>{" "}
            {annotation.tags.map((tag) => tag.tagName).join(", ") ||
              "tidak ada tags"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {annotation.isVerified ? (
              <span className="text-green-600 font-semibold">Verified</span>
            ) : (
              "Not Verified"
            )}
          </p>
          {!annotation.isVerified ? (
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => handleAction("reject")}
                disabled={isVerifying}
                className="w-full px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
              >
                {isVerifying ? "Memproses..." : "Reject"}
              </button>
              <button
                onClick={() => handleAction("accept")}
                disabled={isVerifying}
                className="w-full px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
              >
                {isVerifying ? "Memproses..." : "Accept"}
              </button>
            </div>
          ) : (
            <p className="text-center text-green-600 font-semibold">
              Pengetahuan telah diverifikasi. Anda akan diarahkan kembali.
            </p>
          )}
        </div>

        {relatedDocs.length > 0 && (
          <div className="mt-8">
            <h4 className="text-2xl font-bold mb-4 border-b pb-2">
              Dokumen Terkait
            </h4>
            {relatedDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 mb-4">
                <h5 className="text-xl font-bold mb-2">
                  <a
                    href={`/arsip/${doc.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {doc.title}
                  </a>
                </h5>
                <div className="text-lg text-left whitespace-pre-wrap mt-2 overflow-y-auto max-h-60">
                  <HighlightedContent text={doc.content} start={annotation.startNo} end={annotation.endNo} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPengetahuanPage;
