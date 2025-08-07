"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Printer } from "lucide-react";

interface TransferReceiptProps {
  receipt: {
    reference: string;
    amount: number;
    recipientName: string;
    recipientAccountNumber: string;
    description: string;
    timestamp: Date;
  };
  onClose: () => void;
}

export function TransferReceipt({ receipt, onClose }: TransferReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `
Transfer Receipt
================

Reference: ${receipt.reference}
Amount: $${receipt.amount.toFixed(2)}
Recipient: ${receipt.recipientName}
Account Number: ${receipt.recipientAccountNumber}
Description: ${receipt.description}
Date: ${receipt.timestamp.toLocaleString()}

Status: Success
    `;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Transfer Successful!
        </h2>
        <p className="text-gray-600 text-lg">
          Your money has been sent successfully
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-green-700 mb-1">Amount Transferred</p>
          <p className="text-4xl font-bold text-green-600">
            ${receipt.amount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
            Transaction Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reference Number</p>
              <p className="font-mono text-sm bg-white p-2 rounded border">
                {receipt.reference}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Transaction Date</p>
              <p className="font-medium text-gray-900">
                {receipt.timestamp.toLocaleDateString()} at{" "}
                {receipt.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recipient</p>
              <p className="font-semibold text-gray-900 text-lg">
                {receipt.recipientName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Account Number</p>
              <p className="font-mono text-sm text-gray-900">
                {receipt.recipientAccountNumber}
              </p>
            </div>

            {receipt.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{receipt.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handlePrint} className="flex-1 h-12">
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>

        <Button
          variant="outline"
          onClick={handleDownload}
          className="flex-1 h-12"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="mt-6">
        <Button
          onClick={onClose}
          className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
