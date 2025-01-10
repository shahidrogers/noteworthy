import { FolderPlus } from "lucide-react";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { Card } from "@/components/ui/card";

interface DashboardEmptyStateProps {
  onCreateFolder: (name: string) => void;
}

export function DashboardEmptyState({
  onCreateFolder,
}: DashboardEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
      <div className="rounded-full bg-muted p-4 mb-6">
        <FolderPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        No notes or folders yet
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        Create your first folder to start organizing your notes. You can create
        as many folders as you need.
      </p>
      <div className="flex justify-center gap-4">
        <CreateFolderModal onCreateFolder={onCreateFolder} />
      </div>
    </Card>
  );
}
