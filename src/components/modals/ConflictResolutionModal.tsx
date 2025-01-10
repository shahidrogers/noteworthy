import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConflictResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOverride: () => void;
  onLoadNew: () => void;
}

export function ConflictResolutionModal({
  open,
  onOpenChange,
  onOverride,
  onLoadNew,
}: ConflictResolutionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conflict Detected</DialogTitle>
          <DialogDescription>
            This note has been modified elsewhere. How would you like to
            proceed?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button variant="default" onClick={onOverride}>
            Override changes
          </Button>
          <Button variant="outline" onClick={onLoadNew}>
            Load new changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
