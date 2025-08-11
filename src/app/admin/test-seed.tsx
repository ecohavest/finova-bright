"use client";

import { Button } from "@/components/ui/button";
import { seedCardProducts } from "@/actions/admin";
import { toast } from "sonner";

export const TestSeedButton = () => {
  const handleSeed = async () => {
    try {
      const result = await seedCardProducts();
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed");
    }
  };

  return <Button onClick={handleSeed}>Seed Card Products</Button>;
};
