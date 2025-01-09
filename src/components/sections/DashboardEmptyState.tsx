import { CreateFolderModal } from "@/components/modals/CreateFolderModal";

interface DashboardEmptyStateProps {
  onCreateFolder: (name: string) => void;
}

export function DashboardEmptyState({
  onCreateFolder,
}: DashboardEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">No notes or folders yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first folder to get started
      </p>
      <div className="flex justify-center gap-4">
        <CreateFolderModal onCreateFolder={onCreateFolder} />
      </div>
    </div>
  );
}
