import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import { SupportChat } from "./support-chat";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">
          Get help from our support team. Start a new chat or continue an
          existing conversation.
        </p>
      </div>
      <SupportChat />
    </div>
  );
};

export default page;
