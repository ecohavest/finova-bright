"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const KYCDialog = () => {
  const [showDIalog, setShowDialog] = useState(true);
  console.log("render");
  return (
    <AlertDialog open={showDIalog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Identity Verification!</AlertDialogTitle>
          <AlertDialogDescription>
            Due to regulatory requirements, we need to verify your identity.
            Please verify your identity to continue using our platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button asChild>
            <Link href="/dashboard/profile/kyc">Continue</Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default KYCDialog;
