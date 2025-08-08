"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAllKycSubmissions,
  approveKycSubmission,
  rejectKycSubmission,
} from "@/actions/admin";
import { toast } from "sonner";
import {
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  User2,
} from "lucide-react";

type KycRow = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  documentType: string;
  documentNumber: string;
  status: string;
  adminNotes: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
};

const Kyc = () => {
  const [rows, setRows] = useState<KycRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<KycRow | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "">("");
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await getAllKycSubmissions();
      setRows(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        (r.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge>Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDialog = (act: "approve" | "reject", row: KycRow) => {
    setAction(act);
    setSelected(row);
    setNotes("");
    setDialogOpen(true);
  };

  const applyAction = async () => {
    if (!selected || !action) return;
    setActionLoading(true);
    try {
      if (action === "approve") {
        const res = await approveKycSubmission(selected.id, notes);
        toast.success(res.message);
      } else {
        const res = await rejectKycSubmission(selected.id, notes);
        toast.success(res.message);
      }
      setDialogOpen(false);
      setNotes("");
      fetchRows();
    } catch (e) {
      console.error(e);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleString() : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading KYC submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User2 className="w-5 h-5" />
            KYC Submissions
          </CardTitle>
          <CardDescription>Review and manage user KYC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name, email, or document number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filter status (all, pending, approved, rejected)"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-80"
            />
            <Button onClick={fetchRows} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        No KYC submissions found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {r.userName || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {r.userEmail || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{r.documentType}</div>
                          <div className="text-xs font-mono text-gray-600">
                            {r.documentNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(r.status)}</TableCell>
                      <TableCell>{formatDate(r.submittedAt)}</TableCell>
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
                            {r.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openDialog("approve", r)}
                                >
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDialog("reject", r)}
                                >
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {r.status !== "pending" && (
                              <DropdownMenuItem
                                onClick={() => openDialog("reject", r)}
                              >
                                Update Notes
                              </DropdownMenuItem>
                            )}
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
              {action === "approve"
                ? "Approve KYC"
                : action === "reject"
                ? "Reject KYC"
                : "Update"}
            </DialogTitle>
            <DialogDescription>
              {selected && (
                <div className="space-y-1">
                  <div className="font-medium">
                    {selected.userName || "Unknown"}
                  </div>
                  <div className="text-sm">{selected.userEmail || "—"}</div>
                  <div className="text-sm">
                    {selected.documentType} • {selected.documentNumber}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                placeholder="Enter notes for this action..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyAction} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : action === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kyc;
