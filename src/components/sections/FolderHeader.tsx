import { FolderOpen, Plus, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface FolderHeaderProps {
  folderId: string;
  folderName: string;
  notesCount: number;
  isEditing: boolean;
  onEditStart: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onCreateNote: () => void;
}

export function FolderHeader({
  folderId,
  folderName,
  notesCount,
  isEditing,
  onEditStart,
  onRename,
  onDelete,
  onCreateNote,
}: FolderHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-2"
    >
      <div
        key={folderId}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          {isEditing ? (
            <Input
              className="h-8 w-[200px]"
              defaultValue={folderName}
              autoFocus
              onBlur={(e) => onRename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(e.currentTarget.value);
                } else if (e.key === "Escape") {
                  onRename(folderName);
                }
              }}
            />
          ) : (
            <h2
              className="text-xl font-semibold cursor-pointer hover:text-primary hover:underline"
              onClick={onEditStart}
            >
              {folderName}
            </h2>
          )}
          <span className="ml-2 bg-black text-white text-xs px-2 py-1 rounded-3xl">
            {notesCount} {notesCount === 1 ? "note" : "notes"}
          </span>
        </div>
        <div className="items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNote}
            aria-label="Create new note"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="folder options">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <FolderOpen className="h-4 w-4" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
