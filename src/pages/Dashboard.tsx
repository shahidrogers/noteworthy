import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FolderOpen, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { useNoteStore } from "@/stores/noteStore";
import { Note } from "@/stores/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { NoteCard } from "@/components/cards/NoteCard";
import { DashboardEmptyState } from "@/components/sections/DashboardEmptyState";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Access store pieces individually with default values
  const notes = useNoteStore((state) => state.notes ?? []);
  const folders = useNoteStore((state) => state.folders ?? []);
  const createNote = useNoteStore((state) => state.actions.createNote);
  const createFolder = useNoteStore((state) => state.actions.createFolder);
  const deleteNote = useNoteStore((state) => state.actions.deleteNote);
  const deleteFolder = useNoteStore((state) => state.actions.deleteFolder);

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
    if (!searchQuery) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Noteworthy</h1>
        <div className="flex gap-2">
          <CreateFolderModal onCreateFolder={handleCreateFolder} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Display all folders, even empty ones */}
      <div className="space-y-8">
        {/* First show unfiled notes if they exist */}
        {notesByFolder["unfiled"]?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Unfiled Notes</h2>
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">{folder.name}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({folderNotes.length}{" "}
                    {folderNotes.length === 1 ? "note" : "notes"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateNote(folder.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Ellipsis className="mr-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-red-500"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Delete Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

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
      </div>

      {notes.length === 0 && folders.length === 0 && (
        <DashboardEmptyState onCreateFolder={handleCreateFolder} />
      )}
    </div>
  );
}
