import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments } from "../store/postsSlice";
import type { RootState, AppDispatch } from "../store";

interface Document {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  publicVisibility: boolean;
  version: number;
  subversion: number;
}

const LandingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { documents, status, error } = useSelector(
    (state: RootState) => state.documents
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDocuments());
    }
  }, [status, dispatch]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${datePart} pukul ${timePart}`;
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-8xl mt-24 text-title">
          Pengetahuan
          <br />
          Bersama
        </h1>
        <h2 className="text-2xl mt-8 text-text-main">
          Ruang untuk mendokumentasikan, berbagi, dan menelusuri hal-hal
          penting.
        </h2>
        <Link to="/arsip">
          <button className="mt-10 py-5 px-5 font-semibold text-xl rounded-lg bg-accent text-white hover:bg-button-highlight-blue">
            Mulai
          </button>
        </Link>
      </div>

      <hr className="my-10" />

      <section className="text-center">
        <div className="font-bold text-xl mb-16 text-title">Arsip terbaru</div>

        {status === "loading" && (
          <div className="text-text-main">Loading documents...</div>
        )}

        {status === "failed" && (
          <div className="text-red-500">Error: {error}</div>
        )}

        {status === "succeeded" && (
          <div className="flex justify-center gap-12 flex-wrap max-w-5xl mx-auto text-left">
            {documents.slice(0, 3).map((document: Document) => (
              <div
                key={document.id}
                className="flex-1 basis-1/4 min-w-64 p-4 border rounded-md shadow-md bg-primary"
              >
                <Link to={`/arsip/${document.id}`}>
                  <div className="font-semibold italic mb-5 text-link-nav hover:underline">
                    {document.title}
                  </div>
                </Link>
                <div className="font-bold mb-5 text-title">
                  {document.content}
                </div>
                <div className="text-text-main">
                  {formatDate(document.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
