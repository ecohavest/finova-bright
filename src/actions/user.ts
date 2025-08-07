"use server";

import db from "@/db";
import { user, accountInfo, balance, transaction } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

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
