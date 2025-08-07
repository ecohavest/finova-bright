"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface AccountInfoProps {
  accountNumber: string;
  userName: string;
}

const formatAccountNumber = (
  accountNumber: string,
  showFull: boolean = false
) => {
  if (!accountNumber) return "Not assigned";
  if (showFull) return accountNumber;
  const last4 = accountNumber.slice(-4);
  return `•••• ${last4}`;
};

export function AccountInfo({ accountNumber, userName }: AccountInfoProps) {
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAccountNumber = async () => {
    if (!accountNumber) return;

    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast.success("Account number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy account number", error);
      toast.error("Failed to copy account number");
    }
  };

  const handleShareInfo = async () => {
    const shareData = {
      title: "Finova Bright Bank Account",
      text: `Send money to ${userName}\nAccount: ${accountNumber}`,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `Send money to ${userName}\nAccount: ${accountNumber}`
        );
        toast.success("Account info copied to clipboard");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share account info");
      }
    }
  };

  const toggleAccountVisibility = () => {
    setShowFullNumber(!showFullNumber);
  };

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10">
      <div className="text-center mb-4">
        <h2 className="text-sm font-medium text-blue-200 dark:text-blue-300 mb-2">
          ACCOUNT NUMBER
        </h2>
        <div className="text-xl font-mono mb-3 text-white">
          {formatAccountNumber(accountNumber, showFullNumber)}
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAccountVisibility}
            className="text-blue-200 dark:text-blue-300 hover:text-white hover:bg-white/20 dark:hover:bg-white/10 h-8 px-3"
          >
            {showFullNumber ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {showFullNumber ? "Hide" : "Show"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAccountNumber}
            className="text-blue-200 dark:text-blue-300 hover:text-white hover:bg-white/20 dark:hover:bg-white/10 h-8 px-3"
            disabled={!accountNumber}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareInfo}
            className="text-blue-200 dark:text-blue-300 hover:text-white hover:bg-white/20 dark:hover:bg-white/10 h-8 px-3"
            disabled={!accountNumber}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <h3 className="text-xs font-medium text-blue-200 dark:text-blue-300 mb-1">
            TOTAL CREDIT
          </h3>
          <h4 className="text-xs text-blue-300 dark:text-blue-400 mb-2">
            AUG. 2025
          </h4>
          <div className="text-lg font-semibold text-white">$0.00</div>
        </div>
        <div>
          <h3 className="text-xs font-medium text-blue-200 dark:text-blue-300 mb-1">
            TOTAL DEBIT
          </h3>
          <h4 className="text-xs text-blue-300 dark:text-blue-400 mb-2">
            AUG. 2025
          </h4>
          <div className="text-lg font-semibold text-white">$0.00</div>
        </div>
      </div>
    </div>
  );
}
