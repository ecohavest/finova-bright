import React from "react";
import InternalTransferPage from "./internal-transfer-page";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  return <InternalTransferPage />;
};

export default page;
