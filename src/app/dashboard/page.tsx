import { serverAuth } from "@/lib/server-auth";
import { getUserAccountInfo } from "@/actions/user";
import { TransactionsTable } from "./transactions";
import { ServicesGrid } from "./services-grid";
import { AccountInfo } from "./account-info";
import { redirect } from "next/navigation";
import React from "react";

const formatCurrency = (amount: string, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(parseFloat(amount || "0"));
};

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/login");
  }
  if (user.role === "admin") {
    return redirect("/admin");
  }

  const accountInfo = await getUserAccountInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto lg:max-w-4xl">
            <div className="text-center mb-6">
              <h1 className="text-lg font-medium text-blue-200 mb-2">
                SAVINGS
              </h1>
              <div className="text-4xl lg:text-5xl font-bold mb-4">
                {formatCurrency(
                  accountInfo?.balanceAmount || "0",
                  accountInfo?.currency || "USD"
                )}
              </div>
            </div>

            <AccountInfo
              accountNumber={accountInfo?.accountNumber || ""}
              userName={accountInfo?.name || ""}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ServicesGrid />

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Transactions
            </h2>
            <TransactionsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
