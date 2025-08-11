import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React from "react";
import KycInfo from "../kyc-info";
import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/server-auth";

const page = async () => {
  const user = await serverAuth();
  if (!user) return redirect("/login");
  return (
    <div className="container mx-auto px-4 py-8">
      <KycInfo />
      <h1 className="text-4xl font-bold mb-4 text-center">Send Money</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Choose Transfer Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Local Transfer</h2>
              <p className="text-sm text-muted-foreground">
                Transfer money to other users in the same country
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/send/local-transfer">Transfer</Link>
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Internal Transfer</h2>
              <p className="text-sm text-muted-foreground">
                Transfer money to other user of Swift network
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/send/internal-transfer">Transfer</Link>
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Wire Transfer</h2>
              <p className="text-sm text-muted-foreground">
                Transfer money to any user of any bank in any country
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/send/wire-transfer">Transfer</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
