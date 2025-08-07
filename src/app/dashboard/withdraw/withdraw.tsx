import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";

const WithdrawPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Withdraw Funds
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access your money anytime, anywhere
            </p>
          </div>

          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Card Required for Withdrawals
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                You need to request a card before you can withdraw funds from
                your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Why do I need a card?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Enhanced security for your transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Access to ATMs worldwide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Instant withdrawals and purchases</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Quick Card Options
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      Classic Debit Card
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      Premium Debit Card
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      $15.00
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/card/request" className="flex-1">
                  <Button className="w-full" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Request a Card
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/card" className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    View Card Info
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Card requests are processed within 5-7 business days
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Have questions?
              <Button
                variant="link"
                className="p-0 h-auto ml-1 text-blue-600 dark:text-blue-400"
              >
                Contact Support
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
