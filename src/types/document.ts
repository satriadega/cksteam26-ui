export interface Document {
  id: number;
  title: string;
  content: string;
  referenceDocumentId: number | null;
  version: number;
  subversion: number;
  createdAt: string;
  updatedAt: string | null;
  publicVisibility: boolean;
  annotations: object | null;
  tags: string[];
  private: boolean;
  verifiedAll: boolean;
  name: string;
  annotationCount: number;
}
