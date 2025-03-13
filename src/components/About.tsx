// File: src/components/AboutDialog.tsx
"use client";

import React from "react";
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
} from "@/components/ui/alert-dialog";
import { Changelog } from "@/components/ui/editor/Changelog";

type AboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AboutDialog: React.FC<AboutDialogProps> = ({ open, onOpenChange }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-opacity-0" />
        <AlertDialogContent className="flex flex-col items-center justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="items-center justify-center text-center text-lg">
              About Museformer
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col items-center justify-center text-center">
                <div>
                  This version of Museformer is in alpha and may not have many
                  expected features. Please check back soon for further
                  development!
                </div>
                <Changelog />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-card">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default AboutDialog;
