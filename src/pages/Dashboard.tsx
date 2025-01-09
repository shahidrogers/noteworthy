import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Search, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { useNoteStore } from "@/stores/noteStore";
import { Note } from "@/stores/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
        title: "Untitled Note",
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
      console.log("Created new folder:", newFolder);
      return newFolder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Notes</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterNotes(notesByFolder["unfiled"]).map((note) => (
                <Card
                  key={note.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {note.content.replace(/<[^>]*>/g, "")}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {format(new Date(note.updatedAt), "MMM d, yyyy")}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/note/${note.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
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
                        Options
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        Delete Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <Card
                      key={note.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {note.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3">
                          {note.content.replace(/<[^>]*>/g, "")}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/note/${note.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No notes in this folder
                </p>
              )}
            </div>
          );
        })}
      </div>

      {notes.length === 0 && folders.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            No notes or folders yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first folder to get started
          </p>
          <div className="flex justify-center gap-4">
            <CreateFolderModal onCreateFolder={handleCreateFolder} />
          </div>
        </div>
      )}
    </div>
  );
}
