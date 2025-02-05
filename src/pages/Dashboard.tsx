import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useNoteStore } from "@/stores/noteStore";
import { Note } from "@/stores/types";

import { Input } from "@/components/ui/input";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { NoteCard } from "@/components/cards/NoteCard";
import { DashboardEmptyState } from "@/components/sections/DashboardEmptyState";
import { FolderHeader } from "@/components/sections/FolderHeader";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  // Access store pieces individually with default values
  const notes = useNoteStore((state) => state.notes ?? []);
  const folders = useNoteStore((state) => state.folders ?? []);
  const createNote = useNoteStore((state) => state.actions.createNote);
  const createFolder = useNoteStore((state) => state.actions.createFolder);
  const deleteNote = useNoteStore((state) => state.actions.deleteNote);
  const deleteFolder = useNoteStore((state) => state.actions.deleteFolder);
  const renameFolder = useNoteStore((state) => state.actions.renameFolder);

  // Group notes by folder with safeguard
  const notesByFolder = (notes || []).reduce((acc, note) => {
    const folderId = note.folderId || "unfiled";
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  // Filter notes based on search query
  const filterNotes = (notes: Note[]) => {
    const filtered = !searchQuery
      ? notes
      : notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Sort notes by latest first
    return filtered.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt;
      const dateB = b.updatedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  const handleCreateNote = (folderId: string | null) => {
    try {
      const newNote = createNote({
        title: "",
        content: "",
        folderId: folderId,
      });
      navigate(`/note/${newNote.id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleCreateFolder = (name: string) => {
    try {
      const newFolder = createFolder(name);
      if (!newFolder) {
        throw new Error("Failed to create folder");
      }
      toast.success("Folder created");
      return newFolder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const handleDeleteNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click event
    deleteNote(noteId);
    toast.success("Note deleted");
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
    toast.success("Folder deleted");
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (newName.trim()) {
      renameFolder(folderId, newName.trim());
      toast.success("Folder renamed");
    }
    setEditingFolderId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-6 space-y-6 flex flex-col min-h-screen"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Noteworthy</h1>
        <div className="flex gap-2">
          <CreateFolderModal onCreateFolder={handleCreateFolder} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            notes.length ? "Search notes..." : "No notes to search yet.."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          disabled={notes.length === 0}
        />
      </div>

      {notes.length === 0 && folders.length === 0 && (
        <DashboardEmptyState onCreateFolder={handleCreateFolder} />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 flex-grow"
      >
        {/* First, show unfiled notes if they exist */}
        {notesByFolder["unfiled"]?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-left">Unfiled Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filterNotes(notesByFolder["unfiled"]).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          </div>
        )}

        {/* Then show all folders */}
        {folders.map((folder) => {
          const folderNotes = notesByFolder[folder.id] || [];
          const filteredNotes = filterNotes(folderNotes);

          return (
            <div key={folder.id} className="space-y-4">
              <FolderHeader
                folderId={folder.id}
                folderName={folder.name}
                notesCount={folderNotes.length}
                isEditing={editingFolderId === folder.id}
                onEditStart={() => setEditingFolderId(folder.id)}
                onRename={(newName) => handleRenameFolder(folder.id, newName)}
                onDelete={() => handleDeleteFolder(folder.id)}
                onCreateNote={() => handleCreateNote(folder.id)}
              />

              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-left">
                  No notes in this folder
                </p>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Footer */}
      <footer className="text-center mt-auto py-4">
        <p className="text-xs text-muted-foreground">
          noteworthy v1.0 &copy; 2025{" "}
          <a
            href="https://www.shah1d.com"
            className="text-gray-500 hover:underline"
          >
            Shahid Rogers
          </a>
        </p>
      </footer>
    </motion.div>
  );
}
