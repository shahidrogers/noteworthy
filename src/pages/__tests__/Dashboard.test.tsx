/**
 * Dashboard Page Test Cases:
 *
 * 1. Folder Management:
 *    - Create new folder
 *    - Delete folder through dropdown menu options
 *    - Rename folder
 *
 * 2. Note Management:
 *    - Create empty note within selected folder
 *    - Delete note using trash button
 *
 * 3. Search and Filter:
 *    - Filter notes based on search query
 *    - Hide non-matching notes from display
 *
 * 4. View States:
 *    - Display empty state message when no notes/folders exist
 *    - Show notes properly grouped by folders
 *    - Display unfiled (folderless) notes in separate section
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import { useNoteStore } from "@/stores/noteStore";
import userEvent from "@testing-library/user-event";
import { setupMockStore } from "./testUtils";

// Ensure that there's no individual mocking of crypto here.

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockStore();
  });

  it("should handle folder creation", async () => {
    setupMockStore({
      folders: [],
      actions: {
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        createFolder: jest.fn().mockReturnValue({
          id: "new-folder",
          name: "New Folder",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        deleteFolder: jest.fn(),
        setActiveNote: jest.fn(),
        renameFolder: jest.fn(),
        moveNoteToFolder: jest.fn(),
      },
    });
    const { createFolder } = useNoteStore.getState().actions;

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
    useNoteStore.setState({
      folders: [
        {
          id: "1",
          name: "Test Folder",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
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
    });
    const { deleteFolder } = useNoteStore.getState().actions;

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Find and click the ellipsis button by aria-label
    const menuButton = screen.getByRole("button", { name: /folder options/i });
    await userEvent.click(menuButton);

    const deleteMenuItem = await screen.findByText("Delete Folder");
    await userEvent.click(deleteMenuItem);

    await waitFor(() => {
      expect(deleteFolder).toHaveBeenCalledWith("1");
    });
  });

  it("should handle folder renaming", async () => {
    const renameFolder = jest.fn();
    useNoteStore.setState({
      folders: [
        {
          id: "1",
          name: "Old Name",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      actions: {
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        createFolder: jest.fn(),
        deleteFolder: jest.fn(),
        setActiveNote: jest.fn(),
        renameFolder,
        moveNoteToFolder: jest.fn(),
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Click the folder name to start editing
    const folderNameElement = screen.getByText("Old Name");
    await userEvent.click(folderNameElement);

    // Find the input and type new name
    const input = screen.getByDisplayValue("Old Name");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name{enter}");

    await waitFor(() => {
      expect(renameFolder).toHaveBeenCalledWith("1", "New Name");
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

    useNoteStore.setState({
      notes: mockNotes,
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
    });

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

    useNoteStore.setState({
      notes: [],
      folders: [
        {
          id: "1",
          name: "Test Folder",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      activeNoteId: null,
      actions: {
        createNote,
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        createFolder: jest.fn(),
        deleteFolder: jest.fn(),
        setActiveNote: jest.fn(),
        renameFolder: jest.fn(),
        moveNoteToFolder: jest.fn(),
      },
    });

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

    useNoteStore.setState({
      notes: mockNotes,
      folders: [],
      activeNoteId: null,
      actions: {
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote,
        createFolder: jest.fn(),
        deleteFolder: jest.fn(),
        setActiveNote: jest.fn(),
        renameFolder: jest.fn(),
        moveNoteToFolder: jest.fn(),
      },
    });

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
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("No notes or folders yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your first folder to start organizing your notes. You can create as many folders as you need."
      )
    ).toBeInTheDocument();
    // Verify the icon is present
    expect(document.querySelector("svg")).toBeInTheDocument();
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

    useNoteStore.setState({
      notes: mockNotes,
      folders: mockFolders,
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
    });

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
