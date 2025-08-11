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
} from "lucide-react";
import {
  getCardProducts,
  createCardProduct,
  updateCardProduct,
  deleteCardProduct,
  seedCardProducts,
} from "@/actions/admin";
import { toast } from "sonner";

interface CardProduct {
  id: string;
  name: string;
  type: "classic-debit" | "premium-debit" | "gold-credit" | "platinum-credit";
  description: string;
  price: string;
  features: string;
  gradient: string;
  icon: string;
  dailyLimit: string | null;
  monthlyLimit: string | null;
  withdrawalLimit: string | null;
  status: "active" | "inactive";
  sortOrder: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  name: string;
  type: "classic-debit" | "premium-debit" | "gold-credit" | "platinum-credit";
  description: string;
  price: string;
  features: string[];
  gradient: string;
  icon: string;
  dailyLimit: string;
  monthlyLimit: string;
  withdrawalLimit: string;
  sortOrder: string;
}

const CardProductManagement = () => {
  const [cardProducts, setCardProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<CardProduct | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "classic-debit",
    description: "",
    price: "",
    features: [""],
    gradient: "from-slate-700 to-slate-900",
    icon: "CreditCard",
    dailyLimit: "",
    monthlyLimit: "",
    withdrawalLimit: "",
    sortOrder: "0",
  });

  useEffect(() => {
    fetchCardProducts();
  }, []);

  const fetchCardProducts = async () => {
    try {
      setLoading(true);
      const products = await getCardProducts();
      setCardProducts(products);
    } catch (error) {
      console.error("Error fetching card products:", error);
      toast.error("Failed to fetch card products");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    setActionLoading("seed");
    try {
      const result = await seedCardProducts();
      toast.success(result.message);
      fetchCardProducts();
    } catch (error) {
      console.error("Error seeding card products:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to seed card products"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateProduct = async () => {
    setActionLoading("create");
    try {
      const result = await createCardProduct({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price: formData.price,
        features: formData.features.filter((f) => f.trim() !== ""),
        gradient: formData.gradient,
        icon: formData.icon,
        dailyLimit: formData.dailyLimit || null,
        monthlyLimit: formData.monthlyLimit || null,
        withdrawalLimit: formData.withdrawalLimit || null,
        sortOrder: formData.sortOrder || "0",
      });

      toast.success(result.message);
      fetchCardProducts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating card product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create card product"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    setActionLoading("update");
    try {
      const result = await updateCardProduct(selectedProduct.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        features: formData.features.filter((f) => f.trim() !== ""),
        gradient: formData.gradient,
        icon: formData.icon,
        dailyLimit: formData.dailyLimit || null,
        monthlyLimit: formData.monthlyLimit || null,
        withdrawalLimit: formData.withdrawalLimit || null,
        sortOrder: formData.sortOrder || "0",
      });

      toast.success(result.message);
      fetchCardProducts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating card product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update card product"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (product: CardProduct) => {
    setActionLoading(product.id);
    try {
      const newStatus = product.status === "active" ? "inactive" : "active";
      const result = await updateCardProduct(product.id, {
        status: newStatus,
      });

      toast.success(result.message);
      fetchCardProducts();
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setActionLoading("delete");
    try {
      const result = await deleteCardProduct(selectedProduct.id);
      toast.success(result.message);
      fetchCardProducts();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting card product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete card product"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDialog = (action: string, product?: CardProduct) => {
    setDialogAction(action);
    setSelectedProduct(product || null);

    if (action === "edit" && product) {
      setFormData({
        name: product.name,
        type: product.type,
        description: product.description,
        price: product.price,
        features: JSON.parse(product.features),
        gradient: product.gradient,
        icon: product.icon,
        dailyLimit: product.dailyLimit || "",
        monthlyLimit: product.monthlyLimit || "",
        withdrawalLimit: product.withdrawalLimit || "",
        sortOrder: product.sortOrder,
      });
    } else if (action === "create") {
      resetForm();
    }

    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "classic-debit",
      description: "",
      price: "",
      features: [""],
      gradient: "from-slate-700 to-slate-900",
      icon: "CreditCard",
      dailyLimit: "",
      monthlyLimit: "",
      withdrawalLimit: "",
      sortOrder: "0",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount || "0"));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading card products...</span>
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
                <CreditCard className="w-5 h-5" />
                Card Products Management
              </CardTitle>
              <CardDescription>
                Create and manage card products, pricing, features, and limits
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {cardProducts.length === 0 && (
                <Button
                  onClick={handleSeedProducts}
                  disabled={actionLoading === "seed"}
                  variant="outline"
                >
                  {actionLoading === "seed" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    "Seed Initial Products"
                  )}
                </Button>
              )}
              <Button onClick={() => openDialog("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cardProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No card products found</p>
                        <Button
                          onClick={handleSeedProducts}
                          variant="outline"
                          size="sm"
                        >
                          Seed Initial Products
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cardProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            Features: {JSON.parse(product.features).length}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.type.toUpperCase().replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {formatCurrency(product.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div>
                            Daily:{" "}
                            {product.dailyLimit
                              ? formatCurrency(product.dailyLimit)
                              : "No Limit"}
                          </div>
                          <div>
                            Monthly:{" "}
                            {product.monthlyLimit
                              ? formatCurrency(product.monthlyLimit)
                              : "No Limit"}
                          </div>
                          <div>
                            Withdrawal:{" "}
                            {product.withdrawalLimit
                              ? formatCurrency(product.withdrawalLimit)
                              : "No Limit"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              product.status === "active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Badge
                            variant={
                              product.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{product.sortOrder}</span>
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
                              onClick={() => openDialog("edit", product)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(product)}
                              disabled={actionLoading === product.id}
                            >
                              {product.status === "active" ? (
                                <EyeOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              {product.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openDialog("delete", product)}
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
              {dialogAction === "create" && "Create Card Product"}
              {dialogAction === "edit" && "Edit Card Product"}
              {dialogAction === "delete" && "Delete Card Product"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "delete"
                ? selectedProduct && (
                    <div className="space-y-2">
                      <p>Are you sure you want to delete this card product?</p>
                      <p>
                        <strong>Product:</strong> {selectedProduct.name}
                      </p>
                      <p className="text-red-600">
                        This action cannot be undone.
                      </p>
                    </div>
                  )
                : "Fill in the details for the card product."}
            </DialogDescription>
          </DialogHeader>

          {(dialogAction === "create" || dialogAction === "edit") && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Classic Debit"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Card Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value as
                          | "classic-debit"
                          | "premium-debit"
                          | "gold-credit"
                          | "platinum-credit",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic-debit">
                        Classic Debit
                      </SelectItem>
                      <SelectItem value="premium-debit">
                        Premium Debit
                      </SelectItem>
                      <SelectItem value="gold-credit">Gold Credit</SelectItem>
                      <SelectItem value="platinum-credit">
                        Platinum Credit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the card product"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
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

              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={formData.features.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradient">Gradient Classes</Label>
                  <Input
                    id="gradient"
                    value={formData.gradient}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gradient: e.target.value,
                      }))
                    }
                    placeholder="from-slate-700 to-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon Name</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CreditCard">CreditCard</SelectItem>
                      <SelectItem value="Zap">Zap</SelectItem>
                      <SelectItem value="Star">Star</SelectItem>
                      <SelectItem value="Shield">Shield</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dailyLimit">Daily Limit (USD)</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    step="0.01"
                    value={formData.dailyLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyLimit: e.target.value,
                      }))
                    }
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyLimit">Monthly Limit (USD)</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    step="0.01"
                    value={formData.monthlyLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyLimit: e.target.value,
                      }))
                    }
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawalLimit">
                    Withdrawal Limit (USD)
                  </Label>
                  <Input
                    id="withdrawalLimit"
                    type="number"
                    step="0.01"
                    value={formData.withdrawalLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        withdrawalLimit: e.target.value,
                      }))
                    }
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {dialogAction === "delete" ? (
              <Button
                onClick={handleDeleteProduct}
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
                    ? handleCreateProduct
                    : handleUpdateProduct
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

export default CardProductManagement;
