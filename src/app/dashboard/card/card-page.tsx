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
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Lock,
  Plus,
  AlertCircle,
} from "lucide-react";
import { getUserCards } from "@/actions/user";
import { useRouter } from "next/navigation";
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

interface UserCard {
  id: string;
  cardProductId: string;
  cardNumber: string | null;
  expiryDate: string | null;
  status: string;
  paymentStatus: string | null;
  createdAt: Date;
  issuedAt: Date | null;
  cardType: string;
  cardName: string;
  price: string;
  features: string;
  gradient: string;
  dailyLimit: string | null;
  monthlyLimit: string | null;
  withdrawalLimit: string | null;
}

const CardPage = ({ user }: CardPageProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const cards = await getUserCards();
        setUserCards(cards as UserCard[]);

        if (cards.length === 0) {
          router.push("/dashboard/card/request");
        }
      } catch (error) {
        console.error("Error fetching user cards:", error);
        router.push("/dashboard/card/request");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [router]);

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

  const formatCardNumber = (
    cardNumber: string | null,
    showFull: boolean = false
  ): string => {
    // Debug logging
    console.log("formatCardNumber called with:", {
      cardNumber,
      showFull,
      userAccountNumber: user.accountNumber,
    });

    if (showFull && cardNumber) {
      // Check if the card number is already masked (contains asterisks) - legacy format
      if (cardNumber.includes("*")) {
        // Extract the full number from legacy format: "**** **** **** 942260465672"
        const lastDigits = cardNumber.match(/\d+$/);
        if (lastDigits) {
          const fullNumber = lastDigits[0]; // "942260465672"

          // Reconstruct the full 16-digit card number
          // The legacy format stored: **** **** **** [12 digits]
          // We need to reconstruct it as a proper 16-digit card number
          let reconstructedNumber = fullNumber;

          // If it's 12 digits, pad it to 16 with a realistic prefix
          if (fullNumber.length === 12) {
            reconstructedNumber = `4${fullNumber}${"0".repeat(3)}`; // 4 + 12 digits + 3 zeros = 16
          } else if (fullNumber.length < 16) {
            // Pad with zeros to make it 16 digits
            reconstructedNumber = fullNumber.padEnd(16, "0");
          }

          // Format as: 1234 5678 9012 3456
          const formatted = reconstructedNumber.replace(
            /(\d{4})(?=\d)/g,
            "$1 "
          );
          console.log("Returning reconstructed legacy number:", formatted);
          return formatted;
        }
      } else {
        // If it's a real card number (16 digits), format it properly
        const cleanNumber = cardNumber.replace(/\s/g, "");
        if (cleanNumber.length === 16) {
          // Format as: 1234 5678 9012 3456
          const formatted = cleanNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
          console.log("Returning formatted full number:", formatted);
          return formatted;
        }
      }
    }

    // Return masked format
    if (cardNumber && !cardNumber.includes("*")) {
      // For real card numbers, show last 4 digits
      const lastFour = cardNumber.slice(-4);
      const masked = `**** **** **** ${lastFour}`;
      console.log("Returning masked number:", masked);
      return masked;
    } else if (cardNumber && cardNumber.includes("*")) {
      // For legacy masked numbers, extract last 4 digits and show proper mask
      const lastDigits = cardNumber.match(/\d+$/);
      if (lastDigits) {
        const fullNumber = lastDigits[0];
        const lastFour = fullNumber.slice(-4); // Get only last 4 digits
        const masked = `**** **** **** ${lastFour}`;
        console.log("Returning legacy masked number (last 4 only):", masked);
        return masked;
      }
      console.log("Returning original legacy masked number:", cardNumber);
      return cardNumber;
    } else {
      // Fallback
      const masked = `**** **** **** ${user.accountNumber.slice(-4)}`;
      console.log("Returning fallback masked number:", masked);
      return masked;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "issued":
        return "bg-blue-500";
      case "suspended":
        return "bg-red-500";
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
      case "issued":
        return "Issued";
      case "suspended":
        return "Suspended";
      default:
        return status;
    }
  };

  const getCardGradient = (cardType: string) => {
    switch (cardType) {
      case "classic-debit":
        return "from-slate-700 to-slate-900";
      case "premium-debit":
        return "from-blue-600 to-blue-900";
      case "gold-credit":
        return "from-yellow-500 to-yellow-700";
      case "platinum-credit":
        return "from-purple-600 to-purple-900";
      default:
        return "from-blue-600 to-blue-900";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your cards...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Cards Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don&apos;t have any cards yet. Request your first card to
                get started.
              </p>
              <Button asChild>
                <Link href="/dashboard/card/request">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Your First Card
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCard =
    userCards.find((card) => card.status === "active") || userCards[0];

  // Debug: Log the active card data
  console.log("Active card data:", activeCard);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between">
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Cards
              </h1>
              <p className="text-gray-600 dark:text-gray-400 hidden lg:block">
                Manage your cards and view details
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
                <div
                  className={`h-56 w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-br ${getCardGradient(
                    activeCard.cardType
                  )} p-6 text-white relative overflow-hidden shadow-2xl dark:shadow-gray-900/50 transform hover:scale-105 transition-transform duration-300`}
                >
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
                            {activeCard.cardName.toUpperCase()}
                          </div>
                          <div className="text-xs opacity-60">
                            {activeCard.cardType
                              .toUpperCase()
                              .replace("-", " ")}{" "}
                            CARD
                          </div>
                        </div>
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>

                      <div className="text-xl font-mono tracking-wider mb-4">
                        {formatCardNumber(activeCard.cardNumber, showDetails)}
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
                          {showDetails && activeCard.expiryDate
                            ? activeCard.expiryDate
                            : "**/**"}
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
                  onClick={() => {
                    let numberToCopy = "";
                    if (activeCard.cardNumber) {
                      if (activeCard.cardNumber.includes("*")) {
                        // Legacy format - extract and reconstruct
                        const lastDigits = activeCard.cardNumber.match(/\d+$/);
                        if (lastDigits) {
                          const fullNumber = lastDigits[0];
                          if (fullNumber.length === 12) {
                            numberToCopy = `4${fullNumber}${"0".repeat(3)}`;
                          } else {
                            numberToCopy = fullNumber.padEnd(16, "0");
                          }
                        }
                      } else {
                        // Real card number
                        numberToCopy = activeCard.cardNumber.replace(/\s/g, "");
                      }
                    } else {
                      numberToCopy = user.accountNumber.slice(-4);
                    }
                    copyToClipboard(numberToCopy);
                  }}
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
                        <Badge variant="default">
                          {activeCard.cardType.toUpperCase().replace("-", " ")}
                        </Badge>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {activeCard.cardName}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 ${getStatusColor(
                            activeCard.status
                          )} rounded-full`}
                        ></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {getStatusText(activeCard.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Card Number
                    </label>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatCardNumber(activeCard.cardNumber, showDetails)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Expiry Date
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {showDetails && activeCard.expiryDate
                          ? activeCard.expiryDate
                          : "**/**"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Price
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(activeCard.price)}
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Daily Limit
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {activeCard.dailyLimit
                          ? formatCurrency(activeCard.dailyLimit)
                          : "No Limit"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Limit
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {activeCard.monthlyLimit
                          ? formatCurrency(activeCard.monthlyLimit)
                          : "No Limit"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Withdrawal Limit
                      </label>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {activeCard.withdrawalLimit
                          ? formatCurrency(activeCard.withdrawalLimit)
                          : "No Limit"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userCards.length > 1 && (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      All Cards ({userCards.length})
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your other cards and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {card.cardName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {card.cardType.replace("-", " ")}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            card.status === "active" ? "default" : "secondary"
                          }
                        >
                          {getStatusText(card.status)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/dashboard/card/request">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Request New Card
                    </Link>
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
