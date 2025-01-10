import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNoteStore } from "@/stores/noteStore";
import { Note } from "@/stores/types";
import { Save, X, Trash2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { ConfirmCancelModal } from "@/components/modals/ConfirmCancelModal";
import { toast } from "sonner";
import { formatDate, getTextStats } from "@/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ConflictResolutionModal } from "@/components/modals/ConflictResolutionModal";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notes = useNoteStore((state) => state.notes);
  const updateNote = useNoteStore((state) => state.actions.updateNote);
  const deleteNote = useNoteStore((state) => state.actions.deleteNote);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const folders = useNoteStore((state) => state.folders);
  const moveNoteToFolder = useNoteStore(
    (state) => state.actions.moveNoteToFolder
  );

  const [noteData, setNoteData] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  // Conflict resolution code
  const [initialLoadTime] = useState(new Date()); // Add this line to track when we first loaded the note
  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const hasUnsavedChanges = () => {
    if (!noteData) return false;
    return draftTitle !== noteData.title || draftContent !== noteData.content;
  };

  const handleCancel = () => {
    if (!noteData?.title.trim() && !noteData?.content.trim()) {
      setIsLoading(true);
      if (noteData?.id) {
        deleteNote(noteData.id);
        navigate("/");
      } else {
        navigate("/");
      }
      return;
    }

    if (hasUnsavedChanges()) {
      setShowConfirmModal(true);
    } else {
      navigate("/");
    }
  };

  const handleDelete = () => {
    if (!noteData?.id) return;
    setIsLoading(true);
    deleteNote(noteData.id);
    navigate("/");

    toast.success("Note deleted");
  };

  useEffect(() => {
    const foundNote = notes.find((n) => n.id === id) || null;
    setNoteData(foundNote);
    if (foundNote) {
      setDraftTitle(foundNote.title);
      setDraftContent(foundNote.content);
    } else {
      // Focus title input when creating new note
      titleInputRef.current?.focus();
    }
  }, [id, notes]);

  if (!noteData && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto p-6"
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion
                className="h-5 w-5"
                data-testid="file-question-icon"
              />
              Note not found
            </CardTitle>
            <CardDescription>
              The note you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isLoading) {
    return null; // future enhancement: show a loading spinner
  }

  const handleSave = () => {
    if (!noteData) return;

    const currentNote = notes.find((n) => n.id === noteData.id);
    if (currentNote && new Date(currentNote.updatedAt) > initialLoadTime) {
      setShowConflictModal(true);
      return;
    }

    saveChanges();
  };

  const saveChanges = () => {
    if (!noteData) return;
    updateNote(noteData.id, {
      title: draftTitle,
      content: draftContent,
    });
    toast.success("Note saved");
    navigate("/");
  };

  return (
    <>
      <ConflictResolutionModal
        open={showConflictModal}
        onOpenChange={setShowConflictModal}
        onOverride={() => {
          saveChanges();
          setShowConflictModal(false);
        }}
        onLoadNew={() => {
          // Refresh the page to get latest version
          window.location.reload();
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto p-6 space-y-4 h-full text-left"
      >
        <ConfirmCancelModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          onConfirm={() => {
            handleSave();
            setShowConfirmModal(false);
          }}
          onCancel={() => {
            navigate("/");
            setShowConfirmModal(false);
          }}
        />
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div whileTap={{ scale: 0.995 }} className="flex-1">
            <Input
              ref={titleInputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="flex-1 text-lg"
              placeholder="Enter note title..."
              autoFocus={noteData?.title === ""}
            />
          </motion.div>
          <TooltipProvider>
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              className="flex gap-2"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save changes</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      size="icon"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel editing</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      size="icon"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete note</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </TooltipProvider>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MinimalTiptapEditor
            value={draftContent}
            onChange={(content) => setDraftContent(content as string)}
            className="w-full"
            editorContentClassName="p-5"
            output="html"
            placeholder="Type your description here..."
            autofocus={noteData?.title !== ""}
            editable={true}
            editorClassName="focus:outline-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground border-t pt-4"
        >
          <div className="w-full flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="whitespace-nowrap">
              Last updated: {noteData ? formatDate(noteData.updatedAt) : ""}
            </span>
            <span className="hidden sm:inline">•</span>
            {(() => {
              const stats = getTextStats(draftContent);
              return (
                <>
                  <span className="whitespace-nowrap">{stats.words} words</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">
                    {stats.characters} characters
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">
                    {stats.readingTime} min read
                  </span>
                </>
              );
            })()}
          </div>
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={noteData?.folderId || "none"}
                onValueChange={(value) => {
                  moveNoteToFolder(
                    noteData?.id ?? "",
                    value === "none" ? null : value
                  );
                  toast.success("Note moved to folder");
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
