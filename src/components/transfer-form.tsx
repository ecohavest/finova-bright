"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserByAccountNumber, initiateTransfer } from "@/actions/user";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
}

export function TransferForm({ onTransferComplete }: TransferFormProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  );
}
