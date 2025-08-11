import React from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";
import { getUserCards } from "@/actions/user";
import WireTransferPage from "./wire-transfer-page";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  const cards = await getUserCards();
  const userHasCards = cards.length > 0;
  return <WireTransferPage userHasCards={userHasCards} />;
};

export default page;
