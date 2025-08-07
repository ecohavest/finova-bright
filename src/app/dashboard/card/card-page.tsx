"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Lock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CardPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber: string;
    balanceAmount: string;
  };
}

const CardPage = ({ user }: CardPageProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount: string, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(parseFloat(amount || "0"));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardNumber = "4532 1234 5678 " + user.accountNumber.slice(-4);
  const expiryDate = "12/29";
  const cvv = "123";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between">
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Card
              </h1>
              <p className="text-gray-600 dark:text-gray-400 hidden lg:block">
                Manage your card and view details
              </p>
            </div>
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/card/request">
                  <Plus className="w-4 h-4" />
                  Add Card
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="relative">
                <div className="h-56 w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 dark:from-blue-700 dark:to-blue-950 p-6 text-white relative overflow-hidden shadow-2xl dark:shadow-gray-900/50 transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded-md flex items-center justify-center">
                    <div className="w-8 h-6 bg-white/40 rounded"></div>
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-sm opacity-80 font-medium">
                            PREMIUM DEBIT
                          </div>
                          <div className="text-xs opacity-60">CARD</div>
                        </div>
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>

                      <div className="text-xl font-mono tracking-wider mb-4">
                        {showDetails
                          ? cardNumber
                          : "**** **** **** " + user.accountNumber.slice(-4)}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-80 mb-1">
                          CARD HOLDER
                        </div>
                        <div className="font-semibold text-sm truncate">
                          {user.name.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80 mb-1">
                          VALID THRU
                        </div>
                        <div className="text-sm">
                          {showDetails ? expiryDate : "**/**"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80 mb-1">CVV</div>
                        <div className="text-sm">
                          {showDetails ? cvv : "***"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 left-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 dark:hover:bg-white/30"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => copyToClipboard(cardNumber)}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy Number"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Lock Card
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <CreditCard className="w-5 h-5" />
                    Card Details
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your card information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Card Type
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">DEBIT</Badge>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Premium
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Card Number
                    </label>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {showDetails
                        ? cardNumber
                        : "**** **** **** " + user.accountNumber.slice(-4)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Expiry Date
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {showDetails ? expiryDate : "**/**"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        CVV
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {showDetails ? cvv : "***"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Available Balance
                    </label>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatCurrency(user.balanceAmount)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your card settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Temporarily Lock Card
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Card Settings & Limits
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Request New Card
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPage;
