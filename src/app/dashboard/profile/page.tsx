import { getUserAccountInfo } from "@/actions/user";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }
  const accountInfo = await getUserAccountInfo();

  return (
    <div className="container mx-auto py-10 space-y-8 px-4">
      {/* Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="outline" className="mt-2">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Account Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">
                {accountInfo?.accountNumber || "Not set"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-medium">
                {accountInfo?.balanceAmount
                  ? `${accountInfo.currency} ${accountInfo.balanceAmount}`
                  : "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Profile Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Email Verification
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
