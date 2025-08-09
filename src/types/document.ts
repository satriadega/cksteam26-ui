export interface Tag {
  id: number;
  tagName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Annotation {
  id: number; // Added id property
  documentId: number;
  ownerUserId: number;
  isVerified: boolean;
  selectedText: string;
  startNo: number;
  endNo: number;
  description: string;
  tags: Tag[];
  verified: boolean;
  verifiedBy: string; // Added verifiedBy property based on usage in TambahPengetahuanPage.tsx
  createdAt: string; // Added createdAt property
}

export interface Document {
  id: number;
  title: string;
  content: string;
  publicVisibility: boolean;
  referenceDocumentId: number | null;
  version: number;
  subversion: number;
  private: boolean;
  name: string;
  createdAt: string;
  tags: Tag[] | null;
  annotationCount: number | null;
  annotations: Annotation[] | null;
  username: string;
  isAnnotable: boolean;
}

export interface RelatedDocument extends Document {
  description: string;
  verifiedBy: string;
  tags: Tag[];
}

export interface Version {
  id: number;
  version: number;
  subversion: number;
}
