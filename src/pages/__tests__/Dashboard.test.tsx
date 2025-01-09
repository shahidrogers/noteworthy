/**
 * Dashboard Page Test Cases:
 *
 * 1. Folder Operations:
 *    - Creates a new folder with given name
 *    - Deletes an existing folder
 *
 * 2. Note Operations:
 *    - Creates a new note within a folder
 *    - Deletes an existing note
 *
 * 3. Search Functionality:
 *    - Filters notes based on search query
 *
 * 4. Display States:
 *    - Shows empty state when no notes/folders exist
 *    - Correctly displays notes grouped by folders
 *    - Shows unfiled notes separately
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import { useNoteStore } from "@/stores/noteStore";
import { Note, Folder } from "@/stores/types";
import userEvent from "@testing-library/user-event";

// Mock the useNoteStore hook
jest.mock("@/stores/noteStore");

// Ensure that there's no individual mocking of crypto here.

const mockedUseNoteStore = useNoteStore as jest.MockedFunction<
  typeof useNoteStore
>;

interface MockState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  actions: {
    createNote: jest.Mock;
    updateNote: jest.Mock;
    deleteNote: jest.Mock;
    createFolder: jest.Mock;
    deleteFolder: jest.Mock;
    setActiveNote: jest.Mock;
  };
}

interface MockStateOverrides {
  notes?: Note[];
  folders?: Folder[];
  activeNoteId?: string | null;
  actions?: Partial<MockState["actions"]>;
}

const defaultActions = {
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  createFolder: jest.fn(),
  deleteFolder: jest.fn(),
  setActiveNote: jest.fn(),
};

const createMockState = (overrides: MockStateOverrides = {}): MockState => ({
  notes: overrides.notes ?? [],
  folders: overrides.folders ?? [],
  activeNoteId: overrides.activeNoteId ?? null,
  actions: {
    ...defaultActions,
    ...overrides.actions,
  },
});

describe("Dashboard", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseNoteStore.mockImplementation((selector) =>
      selector(createMockState())
    );
  });

  it("should handle folder creation", async () => {
    const mockFolder = {
      id: "new-folder-id",
      name: "New Folder",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createFolder = jest.fn().mockReturnValue(mockFolder);
    mockedUseNoteStore.mockImplementation((selector) =>
      selector(
        createMockState({
          actions: { createFolder },
        })
      )
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Click the first "New Folder" button to open modal
    const newFolderButtons = screen.getAllByText("New Folder");
    fireEvent.click(newFolderButtons[0]);

    // Wait for the modal to appear and interact with it
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/folder name/i);
      fireEvent.change(input, { target: { value: "New Folder" } });
    });

    const createButton = await screen.findByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(createFolder).toHaveBeenCalledWith("New Folder");
    await waitFor(() => {
      expect(createFolder).toHaveReturned();
    });
  });

  it("should handle folder deletion", async () => {
    const deleteFolder = jest.fn();
    mockedUseNoteStore.mockImplementation((selector) =>
      selector(
        createMockState({
          folders: [
            {
              id: "1",
              name: "Test Folder",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          actions: { deleteFolder },
        })
      )
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Find and click the ellipsis button that opens the dropdown
    const menuButton = screen.getByRole("button", { name: "" });
    await userEvent.click(menuButton);

    const deleteMenuItem = await screen.findByText("Delete Folder");
    await userEvent.click(deleteMenuItem);

    await waitFor(() => {
      expect(deleteFolder).toHaveBeenCalledWith("1");
    });
  });

  it("should filter notes based on search query", async () => {
    const mockNotes = [
      {
        id: "1",
        title: "Test Note",
        content: "content",
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Another Note",
        content: "content",
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockedUseNoteStore.mockImplementation((selector) =>
      selector(createMockState({ notes: mockNotes }))
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await userEvent.type(searchInput, "Test");

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.queryByText("Another Note")).not.toBeInTheDocument();
  });

  it("should handle note creation", async () => {
    const createNote = jest.fn().mockReturnValue({ id: "new-note-id" });

    mockedUseNoteStore.mockImplementation((selector) =>
      selector(
        createMockState({
          folders: [
            {
              id: "1",
              name: "Test Folder",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          actions: { createNote },
        })
      )
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const newNoteButton = screen.getByText("New Note");
    await userEvent.click(newNoteButton);

    expect(createNote).toHaveBeenCalledWith({
      title: "",
      content: "",
      folderId: "1",
    });
  });

  it("should handle note deletion", async () => {
    const deleteNote = jest.fn();
    const mockNotes = [
      {
        id: "1",
        title: "Test Note",
        content: "content",
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockedUseNoteStore.mockImplementation((selector) =>
      selector(
        createMockState({
          notes: mockNotes,
          actions: { deleteNote },
        })
      )
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Find the trash icon button using the SVG path
    const trashButton = screen.getByRole("button", {
      name: "", // The button currently has no accessible name
    });
    await userEvent.click(trashButton);

    expect(deleteNote).toHaveBeenCalledWith("1");
  });

  it("should show empty state when no notes or folders exist", () => {
    mockedUseNoteStore.mockImplementation((selector) =>
      selector(createMockState({ notes: [], folders: [] }))
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/create your first folder/i)).toBeInTheDocument();
  });

  it("should display notes grouped by folders", () => {
    const mockNotes = [
      {
        id: "1",
        title: "Folder Note",
        content: "",
        folderId: "folder1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Unfiled Note",
        content: "",
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockFolders = [
      {
        id: "folder1",
        name: "Test Folder",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockedUseNoteStore.mockImplementation((selector) =>
      selector(
        createMockState({
          notes: mockNotes,
          folders: mockFolders,
        })
      )
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Unfiled Notes")).toBeInTheDocument();
    expect(screen.getByText("Test Folder")).toBeInTheDocument();
    expect(screen.getByText("Folder Note")).toBeInTheDocument();
    expect(screen.getByText("Unfiled Note")).toBeInTheDocument();
  });
});
