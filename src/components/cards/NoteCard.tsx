import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Note } from "@/stores/types";

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string, event: React.MouseEvent) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/note/${note.id}`)}
    >
      <CardHeader className="text-left py-3 px-4">
        <CardTitle className="line-clamp-1 text-base">
          {note.title || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-left py-0 px-4">
        <p className="text-muted-foreground text-sm line-clamp-1 leading-normal">
          {note.content
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground py-3 px-4">
        <span className="bg-gray-100 text-black-900 text-xs mr-2 px-2.5 py-0.5 rounded">
          {format(new Date(note.updatedAt), "h:mma, MMM d yyyy")}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={(e) => onDelete(note.id, e)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
