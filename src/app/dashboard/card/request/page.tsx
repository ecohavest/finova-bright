import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import RequestCard from "./request-card";
import { getUserAccountInfo } from "@/actions/user";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }

  const accountInfo = await getUserAccountInfo();

  return (
    <RequestCard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        accountNumber: accountInfo?.accountNumber || "",
        balanceAmount: accountInfo?.balanceAmount || "",
      }}
    />
  );
};

export default page;
