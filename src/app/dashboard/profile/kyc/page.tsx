import { getUserKyc } from "@/actions/user";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import KycPage from "./kyc-page";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }
  const kyc = await getUserKyc();
  return (
    <div>
      <KycPage initial={kyc ?? undefined} />
    </div>
  );
};

export default page;
