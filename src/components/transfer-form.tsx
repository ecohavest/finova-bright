"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserByAccountNumber, initiateTransfer } from "@/actions/user";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  CreditCard,
  Shield,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Recipient {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  balanceAmount: string;
}

interface TransferReceipt {
  reference: string;
  amount: number;
  recipientName: string;
  recipientAccountNumber: string;
  description: string;
  timestamp: Date;
}

interface TransferFormProps {
  onTransferComplete: (receipt: TransferReceipt) => void;
  userHasCards: boolean;
}

export function TransferForm({
  onTransferComplete,
  userHasCards,
}: TransferFormProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [noCardDialogOpen, setNoCardDialogOpen] = useState(false);

  const handleAccountNumberChange = async (value: string) => {
    setAccountNumber(value);
    setRecipient(null);
    setError("");
    setSuccess("");

    if (value.length >= 8) {
      setLoading(true);
      try {
        const recipientData = await getUserByAccountNumber(value);
        setRecipient(recipientData as Recipient);
        setSuccess(`Found recipient: ${recipientData.name}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!userHasCards) {
        setNoCardDialogOpen(true);
        setLoading(false);
        return;
      }
      const receipt = await initiateTransfer(
        accountNumber,
        parseFloat(amount),
        description || `Transfer to ${recipient.name}`
      );

      setSuccess("Transfer completed successfully!");
      onTransferComplete(receipt);

      setAccountNumber("");
      setAmount("");
      setDescription("");
      setRecipient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {noCardDialogOpen && <NoCardDialog />}
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Transfer Details
          </h2>
          <p className="text-gray-600">
            Enter the recipient account number and transfer amount
          </p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="accountNumber"
              className="text-sm font-medium text-gray-700"
            >
              Recipient Account Number
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter recipient account number"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              disabled={loading}
              className="h-12 text-base"
            />
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying account number...</span>
              </div>
            )}
          </div>

          {recipient && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Recipient Verified
                  </h3>
                  <p className="text-sm text-green-700">
                    <strong>{recipient.name}</strong>
                  </p>
                  <p className="text-xs text-green-600 font-mono">
                    {recipient.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && !recipient && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                Amount (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading || !recipient}
                  min="0"
                  step="0.01"
                  className="h-12 text-base pl-8"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description (Optional)
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="What is this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              disabled={
                loading || !recipient || !amount || parseFloat(amount) <= 0
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                `Send $${amount || "0.00"}`
              )}
            </Button>
          </div>

          {recipient && amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Transfer Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium text-gray-900">
                    {recipient.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">For:</span>
                    <span className="font-medium text-gray-900">
                      {description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

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
