import { StateCreator } from "zustand";
import { Note, Folder } from "../types";

/**
 * Note from Shahid: This middleware enables synchronization of state across browser tabs/windows.
 *
 * In a production app, I'd probably use something like tRPC for client-server sync,
 * but this app only needs to sync state across browser contexts since data is stored locally.
 *
 * BroadcastChannel is perfect for this use case as it provides a simple way for browser
 * tabs/windows to communicate with each other.
 */

interface NoteState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  actions: Record<string, unknown>;
}

// Initialize BroadcastChannel for cross-tab communication
// Only available in browser environment, hence the typeof check
const channel =
  typeof window !== "undefined"
    ? new BroadcastChannel("noteworthy-sync")
    : null;

export const syncMiddleware =
  <T extends NoteState>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) => {
    // Set up listener for state updates from other tabs
    if (typeof window !== "undefined") {
      channel?.addEventListener("message", (event) => {
        const { type, state } = event.data as {
          type: string;
          state: Partial<NoteState>;
        };

        // When receiving a state update from another tab,
        // merge it with current state while preserving actions
        if (type === "STATE_UPDATE") {
          set({ ...state, actions: get().actions } as T, true);
        }
      });
    }

    return config(
      (partial) => {
        // Apply the state update locally
        set(partial);

        // Broadcast state changes to other tabs
        // Only sync essential state properties (notes, folders, activeNoteId)
        const state = get();
        channel?.postMessage({
          type: "STATE_UPDATE",
          state: {
            notes: state.notes,
            folders: state.folders,
            activeNoteId: state.activeNoteId,
          },
        });
      },
      get,
      api
    );
  };
