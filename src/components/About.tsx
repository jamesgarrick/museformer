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
            <AlertDialogTitle className="items-center justify-center text-center">
              About Museformer
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="m-3">Version 0.1.0</div>
                <div>
                  This version of Museformer is in early alpha and may not have
                  many expected features. Please check back soon for further
                  development!
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default AboutDialog;
