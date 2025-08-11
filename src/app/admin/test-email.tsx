"use client";

import React from "react";
import { sendWelcomeEmail } from "@/actions/mail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function TestEmail() {
  const handleSendEmail = async () => {
    try {
      await sendWelcomeEmail(
        "kanexed526@cotasen.com",
        "John Doe",
        "1234567890"
      );
      toast.success("Email sent successfully");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <Button onClick={handleSendEmail}>Send Email</Button>
    </div>
  );
}

export default TestEmail;
