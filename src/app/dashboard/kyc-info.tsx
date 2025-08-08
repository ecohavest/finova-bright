import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { serverAuth } from "@/lib/server-auth";
import { getUserKyc } from "@/actions/user";

const KycInfo = async () => {
  const user = await serverAuth();
  if (!user) return null;
  const kyc = await getUserKyc();

  const status = kyc?.status ?? "unsubmitted";

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">KYC Verification</h2>
          <Badge
            variant={
              status === "approved"
                ? "default"
                : status === "rejected"
                ? "destructive"
                : "secondary"
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {status === "approved"
            ? "Your identity is verified."
            : status === "pending"
            ? "Your submission is under review."
            : status === "rejected"
            ? "Your submission was rejected. Please resubmit."
            : "Complete KYC to unlock all features."}
        </p>
        <Link href="/dashboard/profile/kyc" className="text-sm underline">
          {status === "unsubmitted" || status === "rejected"
            ? "Start KYC"
            : "View / Update"}
        </Link>
      </CardContent>
    </Card>
  );
};

export default KycInfo;
