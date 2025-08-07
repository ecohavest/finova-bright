"use client";

import { useState } from "react";
import { TransferForm } from "@/components/transfer-form";
import { TransferReceipt } from "@/components/transfer-receipt";

interface TransferReceipt {
  reference: string;
  amount: number;
  recipientName: string;
  recipientAccountNumber: string;
  description: string;
  timestamp: Date;
}

const SendPage = () => {
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  const handleTransferComplete = (transferReceipt: TransferReceipt) => {
    setReceipt(transferReceipt);
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Send Money</h1>
            <p className="text-blue-200 dark:text-blue-300 text-lg">
              Transfer money to other users securely
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {receipt ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <TransferReceipt receipt={receipt} onClose={handleCloseReceipt} />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <TransferForm onTransferComplete={handleTransferComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendPage;
