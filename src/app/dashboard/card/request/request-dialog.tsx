import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, AlertTriangle, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CardType } from "./request-card";
import {
  createCardRequest,
  confirmCardPayment,
  getActivePaymentAccounts,
} from "@/actions/user";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const RequestDialog = ({
  onClose,
  selectedCard,
  cards,
  user,
}: {
  onClose: () => void;
  selectedCard: string;
  cards: CardType[];
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber: string;
    balanceAmount: string;
  };
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardRequestId, setCardRequestId] = useState<string | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<
    Array<{
      id: string;
      type: "bank" | "paypal" | "crypto";
      label: string;
      currency: string | null;
      details: Record<string, string>;
      instructions: string | null;
    }>
  >([]);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState<
    string | null
  >(null);
  const card = cards.find((card) => card.id === selectedCard);
  const router = useRouter();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showPayment && !paymentConfirmed) {
        e.preventDefault();
        e.returnValue =
          "You have a pending payment. Are you sure you want to leave?";
        return "You have a pending payment. Are you sure you want to leave?";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (showPayment && !paymentConfirmed) {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
        alert("Please complete your payment before leaving this page.");
      }
    };

    if (showPayment && !paymentConfirmed) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showPayment, paymentConfirmed]);

  useEffect(() => {
    const loadPaymentAccounts = async () => {
      try {
        const accounts = await getActivePaymentAccounts();
        setPaymentAccounts(accounts);
        if (accounts.length > 0) setSelectedPaymentAccountId(accounts[0].id);
      } catch (e) {
        console.error("Failed to load payment accounts", e);
      }
    };
    loadPaymentAccounts();
  }, []);

  const handleConfirmRequest = async () => {
    if (!card) return;

    setIsLoading(true);
    try {
      const paymentReference = `Card-${card.id.toUpperCase()}-${user.id.slice(
        -6
      )}`;

      const result = await createCardRequest(
        card.id,
        paymentReference,
        selectedPaymentAccountId || undefined
      );

      if (result.success) {
        setCardRequestId(result.cardId);
        setShowPayment(true);
      }
    } catch (error) {
      console.error("Error creating card request:", error);
      alert("Failed to create card request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!cardRequestId) return;

    setIsLoading(true);
    try {
      const result = await confirmCardPayment(cardRequestId);

      if (result.success) {
        setPaymentConfirmed(true);
        setTimeout(() => {
          onClose();
          router.push("/dashboard/card");
        }, 2000);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  if (showPayment) {
    return (
      <div className="w-full h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-[9999]">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Payment Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Choose Payment Method</h4>
              <RadioGroup
                value={selectedPaymentAccountId || undefined}
                onValueChange={(v) => setSelectedPaymentAccountId(v)}
                className="grid gap-3"
              >
                {paymentAccounts.map((pa) => (
                  <div
                    key={pa.id}
                    className={`border rounded-md p-3 cursor-pointer ${
                      selectedPaymentAccountId === pa.id
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                    onClick={() => setSelectedPaymentAccountId(pa.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={pa.id} id={`pa-${pa.id}`} />
                        <Label
                          htmlFor={`pa-${pa.id}`}
                          className="cursor-pointer"
                        >
                          {pa.label} ({pa.type.toUpperCase()})
                        </Label>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {pa.type === "bank" && (
                        <>
                          {pa.details.bankName && (
                            <div>
                              Bank: <strong>{pa.details.bankName}</strong>
                            </div>
                          )}
                          {pa.details.accountName && (
                            <div>
                              Account Name:{" "}
                              <strong>{pa.details.accountName}</strong>
                            </div>
                          )}
                          {pa.details.accountNumber && (
                            <div>
                              Account Number:{" "}
                              <strong>{pa.details.accountNumber}</strong>
                            </div>
                          )}
                          {pa.details.routingNumber && (
                            <div>
                              Routing Number:{" "}
                              <strong>{pa.details.routingNumber}</strong>
                            </div>
                          )}
                          {pa.details.swift && (
                            <div>
                              SWIFT: <strong>{pa.details.swift}</strong>
                            </div>
                          )}
                          {pa.details.iban && (
                            <div>
                              IBAN: <strong>{pa.details.iban}</strong>
                            </div>
                          )}
                        </>
                      )}
                      {pa.type === "paypal" && (
                        <div>
                          PayPal Email: <strong>{pa.details.email}</strong>
                        </div>
                      )}
                      {pa.type === "crypto" && (
                        <>
                          {pa.details.network && (
                            <div>
                              Network: <strong>{pa.details.network}</strong>
                            </div>
                          )}
                          {pa.details.address && (
                            <div>
                              Address:{" "}
                              <strong className="break-all">
                                {pa.details.address}
                              </strong>
                            </div>
                          )}
                        </>
                      )}
                      {pa.instructions && (
                        <div className="text-xs text-gray-500">
                          {pa.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {paymentAccounts.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No payment methods available. Please contact support.
                  </div>
                )}
              </RadioGroup>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>
                    Please do not close this tab, refresh the page, or use the
                    back button until you have completed your payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {formatCurrency(parseFloat(card.price))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Payment for {card.name}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Instructions
                </h4>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>
                      Reference:{" "}
                      <strong>
                        Card-{card.id.toUpperCase()}-{user.id.slice(-6)}
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>
                      Amount:{" "}
                      <strong>{formatCurrency(parseFloat(card.price))}</strong>
                    </p>
                  </div>
                  {selectedPaymentAccountId && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Pay to:{" "}
                        <strong>
                          {
                            paymentAccounts.find(
                              (x) => x.id === selectedPaymentAccountId
                            )?.label
                          }
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">After Payment:</p>
                    <p>
                      Click the button below once you have completed the
                      transfer. Your card request will be processed within 24-48
                      hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button
              className="flex-1"
              onClick={handlePaymentConfirmed}
              disabled={paymentConfirmed || isLoading}
            >
              {paymentConfirmed
                ? "Payment Confirmed ✓"
                : isLoading
                ? "Processing..."
                : "I Have Made the Payment"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={showPayment && !paymentConfirmed}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center z-[9999]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Request {card.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant={card.type.includes("credit") ? "default" : "secondary"}
            >
              {card.type.toUpperCase().replace("-", " ")}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {card.description}
            </span>
          </div>

          <div
            className={`h-48 w-80 mx-auto rounded-xl bg-gradient-to-br ${card.gradient} p-6 text-white relative overflow-hidden shadow-2xl dark:shadow-gray-900/50`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm opacity-80">
                      {card.name.toUpperCase()}
                    </div>
                    <div className="text-xs opacity-60">
                      {card.type.toUpperCase().replace("-", " ")} CARD
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
                  <div className="text-xs opacity-80">CARD HOLDER</div>
                  <div className="font-semibold truncate">
                    {user.name.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">VALID THRU</div>
                  <div className="text-sm">12/29</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {parseFloat(card.price) === 0
                  ? "FREE"
                  : formatCurrency(parseFloat(card.price))}
              </div>
              {parseFloat(card.price) > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  one-time fee
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Card Features
              </h4>
              <ul className="space-y-2">
                {card.features.map((feature, index) => (
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            className="flex-1"
            onClick={handleConfirmRequest}
            disabled={isLoading}
          >
            {isLoading ? "Creating Request..." : "Confirm Request"}
          </Button>
          <Button variant="destructive" onClick={onClose}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RequestDialog;
