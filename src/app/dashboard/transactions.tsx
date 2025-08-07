"use client";
import { useState, useEffect } from "react";
import { getUserTransactions } from "@/actions/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Loader,
  MoreHorizontal,
  Printer,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Transaction {
  id: string;
  type: "transfer_in" | "transfer_out" | "received" | "deposit" | "withdrawal";
  amount: string;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded" | "cancelled";
  description: string | null;
  reference: string | null;
  createdAt: Date;
  senderId: string | null;
  senderName: string | null;
}

const getTransactionIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "transfer_in":
    case "received":
    case "deposit":
      return <ArrowDownIcon className="h-4 w-4 text-green-600" />;
    case "transfer_out":
    case "withdrawal":
      return <ArrowUpIcon className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getTransactionTypeLabel = (type: Transaction["type"]) => {
  switch (type) {
    case "transfer_in":
      return "Transfer In";
    case "transfer_out":
      return "Transfer Out";
    case "received":
      return "Received";
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    default:
      return type;
  }
};

const getStatusVariant = (status: Transaction["status"]) => {
  switch (status) {
    case "success":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    case "refunded":
      return "outline";
    default:
      return "secondary";
  }
};

const formatCurrency = (amount: string, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number.parseFloat(amount));
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const MobileTransactionCard = ({
  transaction,
  onAction,
}: {
  transaction: Transaction;
  onAction: (action: string, transaction: Transaction) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          {getTransactionIcon(transaction.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {getTransactionTypeLabel(transaction.type)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div
            className={`font-mono font-semibold text-sm ${
              transaction.type === "transfer_in" ||
              transaction.type === "received" ||
              transaction.type === "deposit"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {transaction.type === "transfer_in" ||
            transaction.type === "received" ||
            transaction.type === "deposit"
              ? "+"
              : "-"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          <Badge
            variant={getStatusVariant(transaction.status)}
            className="text-xs mt-1"
          >
            {transaction.status}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onAction("view-details", transaction)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction("print-receipt", transaction)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const isMobile = useIsMobile();

  const printReceipt = (transaction: Transaction) => {
    const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transaction Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            max-width: 300px;
            margin: 0 auto;
            padding: 10mm;
            line-height: 1.4;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          
          .receipt-container {
            width: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          
          .receipt-title {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .transaction-details {
            margin: 15px 0;
          }
          
          .detail-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            table-layout: fixed;
          }
          
          .detail-row .label {
            display: table-cell;
            font-weight: bold;
            width: 45%;
            vertical-align: top;
            padding-right: 5px;
          }
          
          .detail-row .value {
            display: table-cell;
            width: 55%;
            text-align: right;
            word-wrap: break-word;
            vertical-align: top;
          }
          
          .detail-row.amount {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 14px;
            font-weight: bold;
          }
          
          .detail-row.amount .value {
            font-size: 16px;
          }
          
          .separator {
            border-top: 1px dashed #000;
            margin: 15px 0;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px dashed #000;
            font-size: 10px;
            color: #666;
          }
          
          .footer p {
            margin-bottom: 3px;
          }
          
          .long-text {
            word-break: break-all;
            font-size: 10px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 5mm;
              width: auto;
              max-width: none;
            }
            
            .receipt-container {
              width: 80mm;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="company-name">Finova Bright Bank</div>
            <div class="receipt-title">Transaction Receipt</div>
          </div>
          
          <div class="transaction-details">
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value long-text">${transaction.id.slice(-12)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(transaction.createdAt)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Type:</span>
              <span class="value">${getTransactionTypeLabel(
                transaction.type
              )}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">${transaction.status.toUpperCase()}</span>
            </div>
            
            ${
              transaction.reference
                ? `
            <div class="detail-row">
              <span class="label">Reference:</span>
              <span class="value long-text">${transaction.reference}</span>
            </div>
            `
                : ""
            }
            
            ${
              transaction.description
                ? `
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${transaction.description}</span>
            </div>
            `
                : ""
            }
            
            ${
              transaction.senderName
                ? `
            <div class="detail-row">
              <span class="label">From:</span>
              <span class="value">${transaction.senderName}</span>
            </div>
            `
                : ""
            }
            
            <div class="separator"></div>
            
            <div class="detail-row amount">
              <span class="label">Amount:</span>
              <span class="value">
                ${
                  transaction.type === "transfer_in" ||
                  transaction.type === "received" ||
                  transaction.type === "deposit"
                    ? "+"
                    : "-"
                }${formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for using Finova Bright Bank</p>
            <p>This is a computer-generated receipt</p>
            <p>Printed on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleAction = async (action: string, transaction: Transaction) => {
    switch (action) {
      case "print-receipt":
        try {
          printReceipt(transaction);
          toast.success("Receipt sent to printer");
        } catch {
          toast.error("Failed to print receipt");
        }
        break;
      case "view-details":
        setSelectedTransaction(transaction);
        setDetailsDialogOpen(true);
        break;

      case "copy-reference":
        if (transaction.reference) {
          await navigator.clipboard.writeText(transaction.reference);
          toast.success("Reference copied to clipboard");
        } else {
          toast.error("No reference available");
        }
        break;
      case "copy-transaction-id":
        await navigator.clipboard.writeText(transaction.id);
        toast.success("Transaction ID copied to clipboard");
        break;
      default:
        console.log(`Unhandled action: ${action}`);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getUserTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found
        </div>
      ) : isMobile ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.map((transaction) => (
            <MobileTransactionCard
              key={transaction.id}
              transaction={transaction}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className="font-medium">
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    <div>
                      {transaction.description || "No description"}
                      {transaction.senderName && (
                        <div className="text-sm text-muted-foreground dark:text-gray-400">
                          From: {transaction.senderName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono ${
                        transaction.type === "transfer_in" ||
                        transaction.type === "received" ||
                        transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "transfer_in" ||
                      transaction.type === "received" ||
                      transaction.type === "deposit"
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground dark:text-gray-400">
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {transaction.reference || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("print-receipt", transaction)
                          }
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Print Receipt
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("view-details", transaction)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("copy-transaction-id", transaction)
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Transaction ID
                        </DropdownMenuItem>
                        {transaction.reference && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction("copy-reference", transaction)
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Reference
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </Label>
                  <div className="font-mono text-sm">
                    {selectedTransaction.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reference
                  </Label>
                  <div className="font-mono text-sm">
                    {selectedTransaction.reference || "No reference"}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Type
                  </Label>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(selectedTransaction.type)}
                    <span className="font-medium">
                      {getTransactionTypeLabel(selectedTransaction.type)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div>
                    <Badge
                      variant={getStatusVariant(selectedTransaction.status)}
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </Label>
                  <div
                    className={`text-lg font-mono font-bold ${
                      selectedTransaction.type === "transfer_in" ||
                      selectedTransaction.type === "received" ||
                      selectedTransaction.type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.type === "transfer_in" ||
                    selectedTransaction.type === "received" ||
                    selectedTransaction.type === "deposit"
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      selectedTransaction.amount,
                      selectedTransaction.currency
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </Label>
                  <div className="text-sm">
                    {formatDate(selectedTransaction.createdAt)}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <div className="text-sm">
                  {selectedTransaction.description || "No description provided"}
                </div>
              </div>
              {selectedTransaction.senderName && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Sender
                  </Label>
                  <div className="text-sm font-medium">
                    {selectedTransaction.senderName}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleAction("copy-transaction-id", selectedTransaction)
                  }
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Transaction ID
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    handleAction("print-receipt", selectedTransaction)
                  }
                  className="flex-1"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
