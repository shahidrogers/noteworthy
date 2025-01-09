import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useNoteStore } from "@/stores/noteStore";
import { Note, Folder } from "@/stores/types";
import userEvent from "@testing-library/user-event";

// Mock the useNoteStore hook
jest.mock("@/stores/noteStore");

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
    const createFolder = jest.fn();
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

    // Click the Options button to open the dropdown
    const optionsButton = screen.getByRole("button", { name: /options/i });
    await userEvent.click(optionsButton);

    const deleteMenuItem = await screen.findByText("Delete Folder");
    await userEvent.click(deleteMenuItem);

    await waitFor(() => {
      expect(deleteFolder).toHaveBeenCalledWith("1");
    });
  });
});
