// src/stores/noteStore.ts
import { create } from 'zustand';
import { Folder, Note } from './types';
import { persist, createJSONStorage } from 'zustand/middleware'

interface NoteState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  actions: {
    createNote: (data: Pick<Note, 'title' | 'content' | 'folderId'>) => void;
    updateNote: (id: string, data: Partial<Pick<Note, 'title' | 'content' | 'folderId'>>) => void;
    deleteNote: (id: string) => void;
    createFolder: (name: string) => void;
    deleteFolder: (id: string) => void;
    setActiveNote: (id: string | null) => void;
  };
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: [],
      activeNoteId: null,
      actions: {
        createNote: (data) => set((state) => ({
          notes: [...state.notes, {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        })),
        updateNote: (id, data) => set((state) => ({
          notes: state.notes.map((note) => 
            note.id === id 
              ? { ...note, ...data, updatedAt: new Date() }
              : note
          )
        })),
        deleteNote: (id) => set((state) => ({
          notes: state.notes.filter((note) => note.id !== id)
        })),
        createFolder: (name) => set((state) => ({
          folders: [...state.folders, {
            id: crypto.randomUUID(),
            name,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        })),
        deleteFolder: (id) => set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id)
        })),
        setActiveNote: (id) => set({ activeNoteId: id })
      }
    }),
    {
      name: 'note-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);