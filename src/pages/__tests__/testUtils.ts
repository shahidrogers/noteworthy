import { useNoteStore } from "@/stores/noteStore";

export function setupMockStore(
  customState?: Partial<ReturnType<typeof useNoteStore.getState>>
) {
  // Basic store defaults or merges with customState
  useNoteStore.setState({
    notes: [],
    folders: [],
    activeNoteId: null,
    actions: {
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      createFolder: jest.fn(),
      deleteFolder: jest.fn(),
      setActiveNote: jest.fn(),
      renameFolder: jest.fn(),
      moveNoteToFolder: jest.fn(),
    },
    ...customState,
  });
}
