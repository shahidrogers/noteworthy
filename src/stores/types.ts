export interface Note {
  id: string;
  title: string;
  content: string; // Stores formatted content (markdown or rich text)
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

