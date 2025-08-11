"use client";
import {
  AlertCircle,
  Zap,
  CreditCard,
  Shield,
  ArrowRight,
  Loader,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const BANKS_US = [
  "JPMorgan Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "U.S. Bank",
  "PNC Bank",
  "Truist Bank",
  "Goldman Sachs Bank USA",
  "Capital One",
  "TD Bank",
  "BMO Bank",
  "Citizens Bank",
  "Fifth Third Bank",
  "KeyBank",
  "Huntington Bank",
  "Ally Bank",
  "American Express National Bank",
  "Discover Bank",
  "Navy Federal Credit Union",
  "Charles Schwab Bank",
];

const LocalTransferPage = ({ userHasCards }: { userHasCards: boolean }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [noCardDialogOpen, setNoCardDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHasCards) {
      setNoCardDialogOpen(true);
      return;
    }
    setIsSending(true);
    console.log("Mock local transfer", { accountNumber, bank });
  };

  const isDisabled = !accountNumber || !bank;

  return (
    <>
      {noCardDialogOpen && <NoCardDialog />}
      {isSending && <LoadingOverlay onCancel={() => setIsSending(false)} />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Local Transfer
              </h1>
              <p className="text-blue-200 dark:text-blue-300 text-lg">
                Send money to a local bank account
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Account Number
                </label>
                <p className="text-xs text-muted-foreground">
                  Enter the account number of the recipient
                </p>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bank</label>
                <p className="text-xs text-muted-foreground">
                  Select the bank of the recipient
                </p>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS_US.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isDisabled || isSending}
                  className="w-full"
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalTransferPage;

const NoCardDialog = () => {
  return (
    <div className="fixed h-screen top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Card Required for Transactions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Access your money anytime, anywhere
              </p>
            </div>

            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Card Required for Transactions
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  You need to request a card before you can complete this
                  transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Why do I need a card?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Enhanced security for your transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Access to ATMs worldwide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Instant withdrawals and purchases</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Quick Card Options
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 dark:text-blue-200">
                        Classic Debit Card
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        FREE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 dark:text-blue-200">
                        Premium Debit Card
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        $15.00
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard/card/request" className="flex-1">
                    <Button className="w-full" size="lg">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Request a Card
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/card" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      View Card Info
                    </Button>
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Card requests are processed within 5-7 business days
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Have questions?
                <Button
                  variant="link"
                  className="p-0 h-auto ml-1 text-blue-600 dark:text-blue-400"
                >
                  Contact Support
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingOverlay = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm mx-4 border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <div className="mb-4">
            <Loader className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Service
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please wait while we prepare this feature for you...
          </p>
          <Button onClick={onCancel} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
