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
  CheckCircle,
  XCircle,
  Package,
  Play,
  Pause,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Mail,
} from "lucide-react";
import {
  getAllCardRequests,
  approveCardRequest,
  rejectCardRequest,
  issueCard,
  activateCard,
  suspendCard,
} from "@/actions/admin";
import { toast } from "sonner";

interface CardRequest {
  id: string;
  cardProductId: string;
  status: string;
  paymentStatus: string | null;
  paymentReference: string | null;
  adminNotes: string | null;
  createdAt: Date;
  issuedAt: Date | null;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  cardProductName: string | null;
  cardProductType: string | null;
  cardProductPrice: string | null;
}

const CardManagement = () => {
  const [cardRequests, setCardRequests] = useState<CardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCard, setSelectedCard] = useState<CardRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [dialogNotes, setDialogNotes] = useState("");

  useEffect(() => {
    fetchCardRequests();
  }, []);

  const fetchCardRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllCardRequests();
      setCardRequests(requests);
    } catch (error) {
      console.error("Error fetching card requests:", error);
      toast.error("Failed to fetch card requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    action: string,
    cardId: string,
    notes?: string
  ) => {
    setActionLoading(cardId);
    try {
      let result;
      switch (action) {
        case "approve":
          result = await approveCardRequest(cardId, notes);
          break;
        case "reject":
          result = await rejectCardRequest(cardId, notes || "");
          break;
        case "issue":
          result = await issueCard(cardId, notes);
          break;
        case "activate":
          result = await activateCard(cardId);
          break;
        case "suspend":
          result = await suspendCard(cardId, notes || "");
          break;
        default:
          throw new Error("Invalid action");
      }

      toast.success(result.message);
      fetchCardRequests();
      setDialogOpen(false);
      setDialogNotes("");
    } catch (error) {
      console.error(`Error ${action}ing card:`, error);
      toast.error(`Failed to ${action} card`);
    } finally {
      setActionLoading(null);
    }
  };

  const openDialog = (action: string, card: CardRequest) => {
    setDialogAction(action);
    setSelectedCard(card);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-blue-500";
      case "issued":
        return "bg-purple-500";
      case "rejected":
        return "bg-red-500";
      case "suspended":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "issued":
        return "Issued";
      case "rejected":
        return "Rejected";
      case "suspended":
        return "Suspended";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount || "0"));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = cardRequests.filter((request) => {
    const matchesSearch =
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      request.cardProductName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false ||
      request.paymentReference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading card requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card Requests Management
          </CardTitle>
          <CardDescription>
            Manage all card requests, approve, reject, issue, and activate cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name, email, card name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchCardRequests} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Card Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No card requests found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {request.userName || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.userEmail || "No email"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {request.cardProductName || "Unknown Card"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.cardProductType?.replace("-", " ") ||
                              "Unknown Type"}
                          </div>
                          <div className="text-sm font-mono text-gray-600">
                            {formatCurrency(request.cardProductPrice || "0")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              request.status
                            )}`}
                          />
                          <Badge variant="secondary">
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {request.paymentStatus === "confirmed" ? (
                              <Badge variant="default" className="text-xs">
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          {request.paymentReference && (
                            <div className="text-xs text-gray-500 font-mono">
                              Ref: {request.paymentReference}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDate(request.createdAt)}
                          </div>
                          {request.issuedAt && (
                            <div className="text-xs text-gray-500">
                              Issued: {formatDate(request.issuedAt)}
                            </div>
                          )}
                        </div>
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

                            {request.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openDialog("approve", request)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDialog("reject", request)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}

                            {request.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => openDialog("issue", request)}
                              >
                                <Package className="w-4 h-4 mr-2" />
                                Issue Card
                              </DropdownMenuItem>
                            )}

                            {request.status === "issued" && (
                              <DropdownMenuItem
                                onClick={() => openDialog("activate", request)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {request.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => openDialog("suspend", request)}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" && "Approve Card Request"}
              {dialogAction === "reject" && "Reject Card Request"}
              {dialogAction === "issue" && "Issue Card"}
              {dialogAction === "activate" && "Activate Card"}
              {dialogAction === "suspend" && "Suspend Card"}
            </DialogTitle>
            <DialogDescription>
              {selectedCard && (
                <div className="space-y-2">
                  <p>
                    <strong>User:</strong>{" "}
                    {selectedCard.userName || "Unknown User"} (
                    {selectedCard.userEmail || "No email"})
                  </p>
                  <p>
                    <strong>Card:</strong>{" "}
                    {selectedCard.cardProductName || "Unknown Card"} (
                    {selectedCard.cardProductType || "Unknown Type"})
                  </p>
                  <p>
                    <strong>Price:</strong>{" "}
                    {formatCurrency(selectedCard.cardProductPrice || "0")}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {(dialogAction === "reject" ||
            dialogAction === "suspend" ||
            dialogAction === "approve" ||
            dialogAction === "issue") && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter notes for this action..."
                  value={dialogNotes}
                  onChange={(e) => setDialogNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedCard &&
                handleAction(dialogAction, selectedCard.id, dialogNotes)
              }
              disabled={actionLoading === selectedCard?.id}
            >
              {actionLoading === selectedCard?.id ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {dialogAction === "approve" && (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {dialogAction === "reject" && (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {dialogAction === "issue" && (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  {dialogAction === "activate" && (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {dialogAction === "suspend" && (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {dialogAction.charAt(0).toUpperCase() + dialogAction.slice(1)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardManagement;
