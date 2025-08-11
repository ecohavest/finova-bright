import React from "react";
import InternalTransferPage from "./internal-transfer-page";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";
import { getUserCards } from "@/actions/user";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  const cards = await getUserCards();
  const userHasCards = cards.length > 0;
  return <InternalTransferPage userHasCards={userHasCards} />;
};

export default page;
