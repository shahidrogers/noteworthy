import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Folder, Note } from "./types";
import { syncMiddleware } from "./middleware/syncMiddleware";
import { StateCreator } from "zustand";
import { encrypt, decrypt } from "../utils/crypto";

interface NoteState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  actions: {
    createNote: (data: Pick<Note, "title" | "content" | "folderId">) => Note;
    updateNote: (
      id: string,
      data: Partial<Pick<Note, "title" | "content" | "folderId">>
    ) => void;
    deleteNote: (id: string) => void;
    createFolder: (name: string) => Folder;
    deleteFolder: (id: string) => void;
    setActiveNote: (id: string | null) => void;
  };
}

const initialState = {
  notes: [] as Note[],
  folders: [] as Folder[],
  activeNoteId: null,
  actions: {} as NoteState["actions"],
};

const storeCreator: StateCreator<NoteState> = (set) => ({
  ...initialState,
  actions: {
    createNote: (data) => {
      const newNote = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({
        ...state,
        notes: [...state.notes, newNote],
      }));
      return newNote;
    },
    updateNote: (id, data) =>
      set((state) => ({
        ...state,
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...data, updatedAt: new Date() } : note
        ),
      })),
    deleteNote: (id) =>
      set((state) => ({
        ...state,
        notes: state.notes.filter((note) => note.id !== id),
      })),
    createFolder: (name) => {
      if (!name.trim()) {
        throw new Error("Folder name cannot be empty");
      }

      const newFolder = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        ...state, // Keep all existing state
        folders: [...state.folders, newFolder],
      }));

      return newFolder;
    },
    deleteFolder: (id) => {
      set((state) => ({
        ...state,
        folders: state.folders.filter((folder) => folder.id !== id),
        notes: state.notes.map((note) =>
          note.folderId === id ? { ...note, folderId: null } : note
        ),
      }));
    },
    setActiveNote: (id) => set({ activeNoteId: id }),
  },
});

/**
 * Note from Shahid: Using secure storage here because why not, it's a good practice ;)
 * Usually during pen testing, the first thing they check is the local storage content
 * to see if we are storing sensitive data in plain text.
 *
 * In production, i'd normally use some kind of secure storage for storing tokens, user data, etc.
 **/
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    return decrypt(value);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const encrypted = await encrypt(value);
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useNoteStore = create<NoteState>()(
  persist(syncMiddleware(storeCreator), {
    name: "note-store",
    storage: createJSONStorage(() => secureStorage),
    version: 1,
    partialize: (state) => ({
      notes: state.notes,
      folders: state.folders,
      activeNoteId: state.activeNoteId,
    }),
  })
);
