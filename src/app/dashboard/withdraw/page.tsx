import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import WithdrawPage from "./withdraw";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }
  return <WithdrawPage />;
};

export default page;
