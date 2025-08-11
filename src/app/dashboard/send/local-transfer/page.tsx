import React from "react";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";
import LocalTransferPage from "./local-transfer-page";
import { getUserCards } from "@/actions/user";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  const cards = await getUserCards();
  const userHasCards = cards.length > 0;
  return <LocalTransferPage userHasCards={userHasCards} />;
};

export default page;
