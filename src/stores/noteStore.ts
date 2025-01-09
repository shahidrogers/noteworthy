// src/stores/noteStore.ts
import { create } from "zustand";
import { Folder, Note } from "./types";
import { persist, createJSONStorage } from "zustand/middleware";

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
  notes: [],
  folders: [],
  activeNoteId: null,
  actions: {} as NoteState["actions"], // Ensure actions are part of the initial state
};

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
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
              note.id === id
                ? { ...note, ...data, updatedAt: new Date() }
                : note
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
    }),
    {
      name: "note-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        activeNoteId: state.activeNoteId,
      }), // Persist only necessary state
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(typeof persistedState === "object" && persistedState !== null
          ? persistedState
          : {}),
        actions: currentState.actions, // Ensure actions are not overwritten
      }),
    }
  )
);
