"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { createUser } from "@/actions/admin";
import { cn } from "@/lib/utils";

const newUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin", "moderator"]),
  balance: z.string(),
});

type NewUserFormData = z.infer<typeof newUserSchema>;

function NewUserForm({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      role: "user",
      balance: "0",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: NewUserFormData) => {
    setIsLoading(true);
    try {
      await createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        balance: parseFloat(data.balance) || 0,
        data: {},
      });

      toast.success("User created successfully!");
      reset();
      window.dispatchEvent(new CustomEvent("refreshUsersTable"));
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error("Error creating user", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("grid gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-3">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="grid gap-3">
        <Label htmlFor="role">Role</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) =>
            setValue("role", value as "user" | "admin" | "moderator")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div className="grid gap-3">
        <Label htmlFor="balance">Initial Balance (USD)</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("balance")}
        />
        {errors.balance && (
          <p className="text-sm text-red-500">{errors.balance.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating User...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </>
        )}
      </Button>
    </form>
  );
}

export default function NewUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="self-end">
          <UserPlus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. They will receive login credentials
            via email.
          </DialogDescription>
        </DialogHeader>
        <NewUserForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
