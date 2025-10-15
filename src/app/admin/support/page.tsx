import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import { SupportChatAdmin } from "./support-chat-admin";

const page = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    return redirect("/");
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 container mx-auto">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Support Chat Management
              </h2>
              <p className="text-muted-foreground">
                Manage customer support conversations and respond to user
                inquiries.
              </p>
            </div>
          </div>
          <SupportChatAdmin />
        </div>
      </div>
    </div>
  );
};

export default page;
