/**
 * EditNote Component Test Cases:
 *
 * 1. Rendering:
 *    - Render existing note data (title and content)
 *    - Show error state and dashboard link when note not found
 *
 * 2. Note Updates:
 *    - Update note title and shows success toast
 *    - Update note content through editor
 *    - Show unsaved changes confirmation modal when cancelling
 *    - Move note to a different folder
 *
 * 3. Note Deletion:
 *    - Handle note deletion
 *    - Show success toast after deletion
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditNote from "../EditNote";
import { useNoteStore } from "@/stores/noteStore";
import { BrowserRouter } from "react-router-dom";
import { toast } from "sonner";
import { setupMockStore } from "./testUtils";

// Mock the router hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "test-note-1" }),
  useNavigate: () => jest.fn(),
}));

// Mock the toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock TipTap editor
jest.mock("@/components/minimal-tiptap", () => ({
  MinimalTiptapEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div data-testid="tiptap-editor">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="mock-editor"
      />
    </div>
  ),
}));

describe("EditNote", () => {
  const mockNote = {
    id: "test-note-1",
    title: "Test Note",
    content: "Test Content",
    folderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFolder = {
    id: "test-folder-1",
    name: "Test Folder",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    setupMockStore({
      notes: [mockNote],
      folders: [mockFolder], // Add mock folder to store
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
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const renderEditNote = () => {
    return render(
      <BrowserRouter>
        <EditNote />
      </BrowserRouter>
    );
  };

  it("renders existing note data", () => {
    renderEditNote();

    expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();
    expect(screen.getByTestId("mock-editor")).toHaveValue("Test Content");
  });

  it("handles note title updates", async () => {
    renderEditNote();

    const titleInput = screen.getByDisplayValue("Test Note");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useNoteStore.getState().actions.updateNote).toHaveBeenCalledWith(
        "test-note-1",
        expect.objectContaining({ title: "Updated Title" })
      );
      expect(toast.success).toHaveBeenCalledWith("Note saved");
    });
  });

  it("handles note content updates", async () => {
    renderEditNote();

    const editor = screen.getByTestId("mock-editor");
    fireEvent.change(editor, { target: { value: "Updated Content" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useNoteStore.getState().actions.updateNote).toHaveBeenCalledWith(
        "test-note-1",
        expect.objectContaining({ content: "Updated Content" })
      );
    });
  });

  it("shows confirmation modal when discarding changes", async () => {
    renderEditNote();

    const titleInput = screen.getByDisplayValue("Test Note");
    fireEvent.change(titleInput, { target: { value: "Changed Title" } });

    const cancelButton = screen.getByTitle("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have unsaved changes. Do you want to save before leaving?"
      )
    ).toBeInTheDocument();
  });

  it("handles note deletion", async () => {
    renderEditNote();

    const deleteButton = screen.getByTitle("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(useNoteStore.getState().actions.deleteNote).toHaveBeenCalledWith(
        "test-note-1"
      );
      expect(toast.success).toHaveBeenCalledWith("Note deleted");
    });
  });

  it("shows error when note is not found", () => {
    useNoteStore.setState({ notes: [] });
    renderEditNote();

    expect(screen.getByText("Note not found.")).toBeInTheDocument();
    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  it("handles moving note to a different folder", async () => {
    renderEditNote();

    // Open the folder select
    const folderSelect = screen.getByRole("combobox");
    fireEvent.click(folderSelect);

    // Select the test folder
    const folderOption = screen.getByText("Test Folder");
    fireEvent.click(folderOption);

    await waitFor(() => {
      expect(
        useNoteStore.getState().actions.moveNoteToFolder
      ).toHaveBeenCalledWith("test-note-1", "test-folder-1");
      expect(toast.success).toHaveBeenCalledWith("Note moved to folder");
    });
  });
});
