"use server";

import db from "@/db";
import {
  user,
  accountInfo,
  balance,
  transaction,
  card,
  cardProduct,
  paymentAccount,
  kyc,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const generateAccountNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ACC${timestamp}${random}`;
};

export async function getUserAccountInfo() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const userWithAccountInfo = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountNumber: accountInfo.accountNumber,
      balanceAmount: balance.amount,
      currency: balance.currency,
    })
    .from(user)
    .leftJoin(accountInfo, eq(user.id, accountInfo.userId))
    .leftJoin(balance, eq(user.id, balance.userId))
    .where(eq(user.id, currentUser.id))
    .limit(1);

  return userWithAccountInfo[0] || null;
}

export async function getUserTransactions() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const transactions = await db
    .select({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      description: transaction.description,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
      senderId: transaction.senderId,
      senderName: user.name,
    })
    .from(transaction)
    .leftJoin(user, eq(transaction.senderId, user.id))
    .where(eq(transaction.userId, currentUser.id))
    .orderBy(desc(transaction.createdAt));

  return transactions;
}

export async function getUserCards() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const userCards = await db
    .select({
      id: card.id,
      cardProductId: card.cardProductId,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      status: card.status,
      paymentStatus: card.paymentStatus,
      createdAt: card.createdAt,
      issuedAt: card.issuedAt,
      cardType: cardProduct.type,
      cardName: cardProduct.name,
      price: cardProduct.price,
      features: cardProduct.features,
      gradient: cardProduct.gradient,
      dailyLimit: cardProduct.dailyLimit,
      monthlyLimit: cardProduct.monthlyLimit,
      withdrawalLimit: cardProduct.withdrawalLimit,
    })
    .from(card)
    .leftJoin(cardProduct, eq(card.cardProductId, cardProduct.id))
    .where(eq(card.userId, currentUser.id))
    .orderBy(desc(card.createdAt));

  return userCards;
}

export async function getActiveCardProducts() {
  const products = await db.query.cardProduct.findMany({
    where: eq(cardProduct.status, "active"),
    orderBy: [cardProduct.sortOrder, cardProduct.createdAt],
  });

  return products.map((product) => ({
    ...product,
    features: JSON.parse(product.features) as string[],
  }));
}

export async function getActivePaymentAccounts() {
  const accounts = await db.query.paymentAccount.findMany({
    where: eq(paymentAccount.status, "active"),
    orderBy: [paymentAccount.sortOrder, paymentAccount.createdAt],
  });

  return accounts.map((a) => ({
    ...a,
    details: JSON.parse(a.details) as Record<string, string>,
  }));
}

export async function createCardRequest(
  cardProductId: string,
  paymentReference: string,
  paymentAccountId?: string
) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  // Verify the card product exists and is active
  const product = await db.query.cardProduct.findFirst({
    where: eq(cardProduct.id, cardProductId),
  });

  if (!product || product.status !== "active") {
    throw new Error("Card product not found or inactive");
  }

  const cardId = crypto.randomUUID();

  try {
    await db.insert(card).values({
      id: cardId,
      userId: currentUser.id,
      cardProductId,
      paymentAccountId: paymentAccountId || null,
      paymentReference,
      paymentStatus: "pending",
      status: "pending",
    });

    revalidatePath("/dashboard/card");
    revalidatePath("/dashboard");

    return {
      success: true,
      cardId,
      message: "Card request created successfully",
    };
  } catch (error) {
    console.error("Error creating card request:", error);
    throw new Error("Failed to create card request");
  }
}

export async function confirmCardPayment(cardId: string) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    await db
      .update(card)
      .set({
        paymentStatus: "confirmed",
        status: "pending",
        updatedAt: new Date(),
      })
      .where(and(eq(card.id, cardId), eq(card.userId, currentUser.id)));

    revalidatePath("/dashboard/card");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Payment confirmed successfully",
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw new Error("Failed to confirm payment");
  }
}

export async function getUserByAccountNumber(accountNumber: string) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const recipient = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountNumber: accountInfo.accountNumber,
      balanceAmount: balance.amount,
    })
    .from(user)
    .leftJoin(accountInfo, eq(user.id, accountInfo.userId))
    .leftJoin(balance, eq(user.id, balance.userId))
    .where(eq(accountInfo.accountNumber, accountNumber))
    .limit(1);

  if (!recipient[0]) {
    throw new Error("Account number not found");
  }

  if (recipient[0].id === currentUser.id) {
    throw new Error("Cannot transfer to your own account");
  }

  return recipient[0];
}

export async function initiateTransfer(
  recipientAccountNumber: string,
  amount: number,
  description: string
) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const sender = await getUserAccountInfo();
  if (!sender) {
    throw new Error("Sender account not found");
  }

  const recipient = await getUserByAccountNumber(recipientAccountNumber);
  if (!recipient) {
    throw new Error("Recipient account not found");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const senderBalance = parseFloat(sender.balanceAmount || "0");
  if (senderBalance < amount) {
    throw new Error("Insufficient balance");
  }

  const reference = `TXN_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await db
      .update(balance)
      .set({
        amount: (senderBalance - amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(balance.userId, sender.id));

    const recipientBalance = parseFloat(recipient.balanceAmount || "0");
    await db
      .update(balance)
      .set({
        amount: (recipientBalance + amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(balance.userId, recipient.id));

    const transactionId1 = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await db.insert(transaction).values({
      id: transactionId1,
      userId: sender.id,
      senderId: sender.id,
      type: "transfer_out",
      amount: amount.toString(),
      currency: sender.currency || "USD",
      status: "success",
      description,
      reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const transactionId2 = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}_rec`;
    await db.insert(transaction).values({
      id: transactionId2,
      userId: recipient.id,
      senderId: sender.id,
      type: "received",
      amount: amount.toString(),
      currency: sender.currency || "USD",
      status: "success",
      description,
      reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/send");

    return {
      success: true,
      reference,
      amount,
      recipientName: recipient.name,
      recipientAccountNumber,
      description,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(error);
    throw new Error("Transfer failed. Please try again.");
  }
}

export async function getTransferReceipt(reference: string) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const transactionRecord = await db
    .select({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      description: transaction.description,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
      senderName: user.name,
    })
    .from(transaction)
    .leftJoin(user, eq(transaction.senderId, user.id))
    .where(eq(transaction.reference, reference))
    .limit(1);

  return transactionRecord[0] || null;
}

const kycSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  documentType: z.string().min(1),
  documentNumber: z.string().min(1),
});

export async function getUserKyc() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const [record] = await db
    .select()
    .from(kyc)
    .where(eq(kyc.userId, currentUser.id))
    .limit(1);

  return record || null;
}

export async function submitKyc(payload: z.infer<typeof kycSchema>) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const data = kycSchema.parse(payload);
  const id = crypto.randomUUID();

  const [existing] = await db
    .select()
    .from(kyc)
    .where(eq(kyc.userId, currentUser.id))
    .limit(1);

  if (existing) {
    await db
      .update(kyc)
      .set({
        ...data,
        status: "pending",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(kyc.userId, currentUser.id));
  } else {
    await db.insert(kyc).values({
      id,
      userId: currentUser.id,
      ...data,
      status: "pending",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile/kyc");

  return { success: true } as const;
}

export async function initializeUserAccountOnSignUp() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const [existingAccount] = await db
    .select()
    .from(accountInfo)
    .where(eq(accountInfo.userId, currentUser.id))
    .limit(1);

  if (existingAccount) {
    return { success: true } as const;
  }

  const accountNumber = generateAccountNumber();
  const accountInfoId = crypto.randomUUID();
  const balanceId = crypto.randomUUID();

  await db.insert(accountInfo).values({
    id: accountInfoId,
    userId: currentUser.id,
    accountNumber,
  });

  await db.insert(balance).values({
    id: balanceId,
    userId: currentUser.id,
    amount: "0",
    currency: "USD",
  });

  return { success: true } as const;
}
