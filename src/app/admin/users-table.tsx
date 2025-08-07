"use client";

import React, { useEffect, useState } from "react";
import {
  getUsers,
  updateUserBalance,
  updateUserInfo,
  banUser,
  unbanUser,
  deleteUser,
} from "@/actions/admin";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Loader,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "admin" | "user" | "moderator";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  accountInfo: {
    accountNumber: string;
  } | null;
  balance: {
    amount: string;
  } | null;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "destructive";
    case "moderator":
      return "secondary";
    case "user":
      return "outline";
    default:
      return "outline";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const createColumns = (
  handleAction: (action: string, user: User) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "accountInfo.accountNumber",
    header: "Account Number",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="font-mono text-sm">
          {user.accountInfo?.accountNumber || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "balance.amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const balance = parseFloat(user.balance?.amount || "0");
      return (
        <div className="text-right font-mono">{formatCurrency(balance)}</div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = (row.getValue("role") as string) || "user";
      return (
        <Badge variant={getRoleBadgeVariant(role as UserRole)}>{role}</Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      const isActive = !user.banned;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Banned"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
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
              onClick={() => handleAction("copy-account", user)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Account Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("update-info", user)}>
              <Edit className="mr-2 h-4 w-4" />
              Update User Info
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("increase-balance", user)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Increase Balance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("reduce-balance", user)}
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Reduce Balance
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("change-role", user)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("toggle-status", user)}
            >
              {!user.banned ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Ban User
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unban User
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("delete", user)}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = await getUsers();
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, user: User) => {
    setSelectedUser(user);
    setActionType(action);

    switch (action) {
      case "copy-account":
        if (user.accountInfo?.accountNumber) {
          await navigator.clipboard.writeText(user.accountInfo.accountNumber);
          toast.success("Account number copied to clipboard");
        } else {
          toast.error("No account number available");
        }
        break;

      case "increase-balance":
      case "reduce-balance":
        setBalanceAmount("");
        setBalanceDialogOpen(true);
        break;

      case "update-info":
        setUserName(user.name);
        setUserEmail(user.email);
        setUserInfoDialogOpen(true);
        break;

      case "toggle-status":
        await handleToggleStatus(user);
        break;

      case "delete":
        await handleDeleteUser(user);
        break;

      case "change-role":
        break;

      default:
        console.log(`Unhandled action: ${action}`);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setActionLoading(true);
    try {
      if (user.banned) {
        await unbanUser(user.id);
        toast.success("User unbanned successfully");
      } else {
        await banUser(user.id, "Banned by admin", 60 * 60 * 24 * 7);
        toast.success("User banned successfully");
      }
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed";
      toast.error("Error updating user status", { description: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${user.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      toast.error("Error deleting user", { description: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBalanceSubmit = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const actionTypeMap = {
        "increase-balance": "increase" as const,
        "reduce-balance": "reduce" as const,
      };

      const mappedActionType =
        actionTypeMap[actionType as keyof typeof actionTypeMap];

      if (!mappedActionType) {
        throw new Error("Invalid action type");
      }

      await updateUserBalance(selectedUser.id, balanceAmount, mappedActionType);
      toast.success(`Balance ${mappedActionType}d successfully`);
      setBalanceDialogOpen(false);
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Update failed";
      toast.error("Error updating balance", { description: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserInfoSubmit = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await updateUserInfo(selectedUser.id, {
        name: userName,
        email: userEmail,
      });
      toast.success("User info updated successfully");
      setUserInfoDialogOpen(false);
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Update failed";
      toast.error("Error updating user info", { description: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchUsers();
    };

    window.addEventListener("refreshUsersTable", handleRefresh);
    return () => {
      window.removeEventListener("refreshUsersTable", handleRefresh);
    };
  }, []);

  const columns = createColumns(handleAction);

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "increase-balance" ? "Increase" : "Reduce"}{" "}
              Balance
            </DialogTitle>
            <DialogDescription>
              Current balance:{" "}
              {formatCurrency(parseFloat(selectedUser?.balance?.amount || "0"))}
              .{" "}
              {actionType === "increase-balance"
                ? "Enter the amount to add to the user's balance."
                : "Enter the amount to subtract from the user's balance."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                {actionType === "increase-balance"
                  ? "Add Amount"
                  : "Subtract Amount"}
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setBalanceDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleBalanceSubmit} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `${
                  actionType === "increase-balance" ? "Increase" : "Reduce"
                } Balance`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={userInfoDialogOpen} onOpenChange={setUserInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update User Information</DialogTitle>
            <DialogDescription>
              Update the user&apos;s name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="col-span-3"
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="col-span-3"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUserInfoDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUserInfoSubmit} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Info"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
