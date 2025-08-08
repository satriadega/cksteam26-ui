import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDocuments } from "../../api";
import type { Document } from "../../types/document";

interface Tag {
  id: number;
  tagName: string;
  createdAt: string;
  updatedAt: string | null;
}

const ListArsip: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getDocuments();
        const data = response.data.data.content as Document[];

        const allTags = data.reduce((acc: string[], document: Document) => {
          if (document.tags && document.tags.length > 0) {
            document.tags.forEach((tag: Tag) => acc.push(tag.tagName));
          }
          return acc;
        }, []);

        const uniqueTags: string[] = [...new Set(allTags)];

        const tagCounts: { [key: string]: number } = {};
        allTags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        const sortedTags = uniqueTags.sort(
          (a: string, b: string) => tagCounts[b] - tagCounts[a]
        );

        setTags(sortedTags);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return <p></p>;
  }

  return (
    <div className="mr-4">
      <Link to="/arsip" className="text-gray-600 hover:text-black mr-4">
        List Arsip
      </Link>
      {tags.length > 0 && (
        <div className="flex">
          Tags:
          {tags.map((tag) => (
            <span key={tag} className="ml-2 px-2 py-1 bg-gray-200 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListArsip;
