export interface Tag {
  id: number;
  tagName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Annotation {
  documentId: number;
  ownerUserId: number;
  isVerified: boolean;
  selectedText: string;
  startNo: number;
  endNo: number;
  description: string;
  tags: Tag[];
  createdAt: string;
  verified: boolean;
}
