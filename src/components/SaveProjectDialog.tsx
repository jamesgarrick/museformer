"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";

type SaveProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (newName: string) => void;
};

const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  open,
  onOpenChange,
  currentName,
  onSave,
}) => {
  const [projectName, setProjectName] = useState(currentName);

  // Update internal state when the dialog is reopened with a new currentName.
  React.useEffect(() => {
    setProjectName(currentName);
  }, [currentName]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-opacity-50" />
        <AlertDialogContent className="flex flex-col items-center justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Save Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Please enter a new name for your project:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="w-full my-4">
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Project Name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onSave(projectName);
                onOpenChange(false);
              }}
              className="hover:bg-primary text-white"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default SaveProjectDialog;
