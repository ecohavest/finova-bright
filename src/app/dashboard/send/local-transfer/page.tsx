import React from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  return <div>page</div>;
};

export default page;
