"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Shield, Star, Check } from "lucide-react";

interface CardType {
  id: string;
  name: string;
  type: "credit" | "debit";
  price: number;
  color: string;
  gradient: string;
  features: string[];
  description: string;
  icon: React.ReactNode;
}

const cardTypes: CardType[] = [
  {
    id: "classic-debit",
    name: "Classic Debit",
    type: "debit",
    price: 0,
    color: "bg-slate-800",
    gradient: "from-slate-700 to-slate-900",
    features: ["Free transactions", "ATM access", "Online shopping"],
    description: "Perfect for everyday spending and ATM withdrawals",
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: "premium-debit",
    name: "Premium Debit",
    type: "debit",
    price: 15,
    color: "bg-blue-800",
    gradient: "from-blue-600 to-blue-900",
    features: [
      "Priority support",
      "Higher limits",
      "Travel insurance",
      "Cashback rewards",
    ],
    description: "Enhanced features for frequent users",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "gold-credit",
    name: "Gold Credit",
    type: "credit",
    price: 50,
    color: "bg-yellow-600",
    gradient: "from-yellow-500 to-yellow-700",
    features: [
      "Credit facility",
      "Rewards program",
      "Purchase protection",
      "Extended warranty",
    ],
    description: "Build credit while earning rewards",
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: "platinum-credit",
    name: "Platinum Credit",
    type: "credit",
    price: 100,
    color: "bg-purple-800",
    gradient: "from-purple-600 to-purple-900",
    features: [
      "Premium credit line",
      "Concierge service",
      "Airport lounge access",
      "Travel benefits",
    ],
    description: "Ultimate luxury and convenience",
    icon: <Shield className="w-6 h-6" />,
  },
];

const RequestCard = ({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber: string;
    balanceAmount: string;
  };
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardRequest = (cardType: CardType) => {
    console.log("Card Request Submitted:", {
      cardType: cardType.type,
      cardId: cardType.id,
      cardName: cardType.name,
      userId: user.id,
      userName: user.name,
      requestingPrice: cardType.price,
      formattedPrice:
        cardType.price === 0 ? "FREE" : formatCurrency(cardType.price),
    });
    alert(
      `${cardType.name} card requested successfully! ${
        cardType.price === 0
          ? "No fee required."
          : `Fee: ${formatCurrency(cardType.price)}`
      }`
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Request Your Card
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the perfect card for your financial needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {cardTypes.map((cardType) => (
              <Card
                key={cardType.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${
                  selectedCard === cardType.id
                    ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg transform scale-105"
                    : "hover:shadow-md dark:hover:shadow-gray-900/50"
                }`}
                onClick={() => setSelectedCard(cardType.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-900 dark:text-gray-100">
                        {cardType.icon}
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {cardType.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        cardType.type === "credit" ? "default" : "secondary"
                      }
                    >
                      {cardType.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {cardType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`h-32 rounded-lg bg-gradient-to-br ${cardType.gradient} p-4 text-white relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    <div className="relative z-10">
                      <div className="text-xs opacity-80 mb-1">CARD HOLDER</div>
                      <div className="font-semibold text-sm truncate">
                        {user.name.toUpperCase()}
                      </div>
                      <div className="text-xs mt-2 opacity-80">
                        **** **** **** {user.accountNumber.slice(-4)}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <div className="text-xs opacity-80">VALID THRU</div>
                          <div className="text-xs">12/29</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-80">CVV</div>
                          <div className="text-xs">***</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {cardType.price === 0
                          ? "FREE"
                          : formatCurrency(cardType.price)}
                      </span>
                      {cardType.price > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          one-time fee
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1">
                      {cardType.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    variant={
                      selectedCard === cardType.id ? "default" : "outline"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardRequest(cardType);
                    }}
                  >
                    {selectedCard === cardType.id
                      ? "Request This Card"
                      : "Select Card"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCard && (
            <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-center text-gray-900 dark:text-gray-100">
                  Card Preview
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                  Here&apos;s how your selected card will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selected = cardTypes.find(
                    (card) => card.id === selectedCard
                  );
                  if (!selected) return null;

                  return (
                    <div className="space-y-6">
                      <div
                        className={`h-48 w-80 mx-auto rounded-xl bg-gradient-to-br ${selected.gradient} p-6 text-white relative overflow-hidden shadow-2xl dark:shadow-gray-900/50`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="text-sm opacity-80">
                                  {selected.name.toUpperCase()}
                                </div>
                                <div className="text-xs opacity-60">
                                  {selected.type.toUpperCase()} CARD
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded"></div>
                            </div>
                            <div className="text-lg font-mono tracking-wider">
                              **** **** **** {user.accountNumber.slice(-4)}
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs opacity-80">
                                CARD HOLDER
                              </div>
                              <div className="font-semibold truncate">
                                {user.name.toUpperCase()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs opacity-80">
                                VALID THRU
                              </div>
                              <div className="text-sm">12/29</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {selected.price === 0
                            ? "FREE"
                            : formatCurrency(selected.price)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selected.description}
                        </p>
                        <Button
                          size="lg"
                          className="mt-4"
                          onClick={() => handleCardRequest(selected)}
                        >
                          Confirm Request - {selected.name}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
