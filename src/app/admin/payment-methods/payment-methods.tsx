"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Banknote,
  Building2,
  Wallet,
} from "lucide-react";
import {
  getPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} from "@/actions/admin";
import { toast } from "sonner";

interface PaymentAccount {
  id: string;
  type: "bank" | "paypal" | "crypto";
  label: string;
  currency: string | null;
  details: string;
  instructions: string | null;
  status: "active" | "inactive";
  sortOrder: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  type: "bank" | "paypal" | "crypto";
  label: string;
  currency: string;
  details: Record<string, string>;
  instructions: string;
  sortOrder: string;
}

const PaymentMethods = () => {
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [formData, setFormData] = useState<FormData>({
    type: "bank",
    label: "",
    currency: "USD",
    details: {},
    instructions: "",
    sortOrder: "0",
  });

  useEffect(() => {
    fetchPaymentAccounts();
  }, []);

  const fetchPaymentAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await getPaymentAccounts();
      setPaymentAccounts(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts:", error);
      toast.error("Failed to fetch payment accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setActionLoading("create");
    try {
      const result = await createPaymentAccount({
        type: formData.type,
        label: formData.label,
        currency: formData.currency,
        details: formData.details,
        instructions: formData.instructions || undefined,
        sortOrder: formData.sortOrder || "0",
      });

      toast.success(result.message);
      fetchPaymentAccounts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating payment account:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create payment account"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    setActionLoading("update");
    try {
      const result = await updatePaymentAccount(selectedAccount.id, {
        type: formData.type,
        label: formData.label,
        currency: formData.currency,
        details: formData.details,
        instructions: formData.instructions || null,
        sortOrder: formData.sortOrder || "0",
      });

      toast.success(result.message);
      fetchPaymentAccounts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating payment account:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payment account"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (account: PaymentAccount) => {
    setActionLoading(account.id);
    try {
      const newStatus = account.status === "active" ? "inactive" : "active";
      const result = await updatePaymentAccount(account.id, {
        status: newStatus,
      });

      toast.success(result.message);
      fetchPaymentAccounts();
    } catch (error) {
      console.error("Error toggling account status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update account status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    setActionLoading("delete");
    try {
      const result = await deletePaymentAccount(selectedAccount.id);
      toast.success(result.message);
      fetchPaymentAccounts();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting payment account:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete payment account"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDialog = (action: string, account?: PaymentAccount) => {
    setDialogAction(action);
    setSelectedAccount(account || null);

    if (action === "edit" && account) {
      setFormData({
        type: account.type,
        label: account.label,
        currency: account.currency || "USD",
        details: JSON.parse(account.details),
        instructions: account.instructions || "",
        sortOrder: account.sortOrder,
      });
    } else if (action === "create") {
      resetForm();
    }

    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "bank",
      label: "",
      currency: "USD",
      details: {},
      instructions: "",
      sortOrder: "0",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building2 className="w-4 h-4" />;
      case "paypal":
        return <CreditCard className="w-4 h-4" />;
      case "crypto":
        return <Wallet className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bank":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paypal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "crypto":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const updateDetail = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  };

  const getDetailFields = () => {
    switch (formData.type) {
      case "bank":
        return [
          {
            key: "bankName",
            label: "Bank Name",
            placeholder: "e.g., Chase Bank",
          },
          {
            key: "accountName",
            label: "Account Name",
            placeholder: "e.g., RTXB Corp",
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "1234567890",
          },
          {
            key: "routingNumber",
            label: "Routing Number",
            placeholder: "021000021",
          },
          { key: "swift", label: "SWIFT Code", placeholder: "CHASUS33" },
          { key: "iban", label: "IBAN", placeholder: "US64SVBKUS6S3300958879" },
        ];
      case "paypal":
        return [
          {
            key: "email",
            label: "PayPal Email",
            placeholder: "payments@rtxb.com",
          },
        ];
      case "crypto":
        return [
          {
            key: "network",
            label: "Network",
            placeholder: "e.g., Bitcoin, Ethereum",
          },
          {
            key: "address",
            label: "Wallet Address",
            placeholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Payment Methods Management
              </CardTitle>
              <CardDescription>
                Manage payment methods for card requests and other transactions
              </CardDescription>
            </div>
            <Button onClick={() => openDialog("create")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Banknote className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">
                          No payment methods found
                        </p>
                        <Button
                          onClick={() => openDialog("create")}
                          variant="outline"
                          size="sm"
                        >
                          Add First Payment Method
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{account.label}</div>
                          {account.instructions && (
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {account.instructions}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(account.type)}
                          <Badge
                            variant="secondary"
                            className={getTypeColor(account.type)}
                          >
                            {account.type.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {account.currency || "USD"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs max-w-xs">
                          {(() => {
                            const details = JSON.parse(account.details);
                            return Object.entries(details).map(
                              ([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span>{" "}
                                  {String(value)}
                                </div>
                              )
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              account.status === "active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Badge
                            variant={
                              account.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {account.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{account.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openDialog("edit", account)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(account)}
                              disabled={actionLoading === account.id}
                            >
                              {account.status === "active" ? (
                                <EyeOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              {account.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openDialog("delete", account)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "create" && "Add Payment Method"}
              {dialogAction === "edit" && "Edit Payment Method"}
              {dialogAction === "delete" && "Delete Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "delete"
                ? selectedAccount && (
                    <div className="space-y-2">
                      <p>
                        Are you sure you want to delete this payment method?
                      </p>
                      <p>
                        <strong>Method:</strong> {selectedAccount.label}
                      </p>
                      <p className="text-red-600">
                        This action cannot be undone.
                      </p>
                    </div>
                  )
                : "Configure the payment method details."}
            </DialogDescription>
          </DialogHeader>

          {(dialogAction === "create" || dialogAction === "edit") && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Payment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "bank" | "paypal" | "crypto") =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                        details: {},
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank/Wire Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="label">Display Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g., Main Bank Account, PayPal Business"
                />
              </div>

              <div>
                <Label>Account Details</Label>
                <div className="space-y-3 mt-2">
                  {getDetailFields().map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={field.key} className="text-sm">
                        {field.label}
                      </Label>
                      <Input
                        id={field.key}
                        value={formData.details[field.key] || ""}
                        onChange={(e) =>
                          updateDetail(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Payment Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  placeholder="Optional instructions for users making payments..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {dialogAction === "delete" ? (
              <Button
                onClick={handleDeleteAccount}
                disabled={actionLoading === "delete"}
                variant="destructive"
              >
                {actionLoading === "delete" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={
                  dialogAction === "create"
                    ? handleCreateAccount
                    : handleUpdateAccount
                }
                disabled={
                  actionLoading === "create" || actionLoading === "update"
                }
              >
                {actionLoading === "create" || actionLoading === "update" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {dialogAction === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {dialogAction === "create" ? "Create" : "Update"}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
