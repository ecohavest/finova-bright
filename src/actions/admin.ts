"use server";

import { auth } from "@/lib/auth";
import { balance, accountInfo, transaction, card, user } from "@/db/schema";
import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";

const generateAccountNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ACC${timestamp}${random}`;
};

const generateCardNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `**** **** **** ${timestamp}${random}`;
};

const generateCVV = () => {
  return Math.floor(Math.random() * 900 + 100).toString();
};

const generateExpiryDate = () => {
  const currentDate = new Date();
  const expiryDate = new Date(
    currentDate.getFullYear() + 4,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  return expiryDate.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "2-digit",
  });
};

export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: string;
  balance?: number;
  data: Record<string, string>;
}) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const accountNumber = generateAccountNumber();

  const newUser = await auth.api.createUser({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role as "user" | "admin",
      data: data.data,
    },
  });

  const accountInfoId = crypto.randomUUID();
  const balanceId = crypto.randomUUID();

  await db.insert(accountInfo).values({
    id: accountInfoId,
    userId: newUser.user.id,
    accountNumber,
  });

  await db.insert(balance).values({
    id: balanceId,
    userId: newUser.user.id,
    amount: data.balance?.toString() || "0",
    currency: "USD",
  });

  return {
    user: newUser.user,
    accountInfo: {
      id: accountInfoId,
      userId: newUser.user.id,
      accountNumber,
    },
    balance: {
      id: balanceId,
      userId: newUser.user.id,
      amount: data.balance?.toString() || "0",
      currency: "USD",
    },
  };
};

export const getUsers = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  const users = await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
    },
    with: {
      accountInfo: {
        columns: {
          accountNumber: true,
        },
      },
      balance: {
        columns: {
          amount: true,
        },
      },
    },
  });
  return users;
};

export const getUser = async (id: string) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  const userInfo = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
    },
    with: {
      accountInfo: {
        columns: {
          accountNumber: true,
        },
      },
      balance: {
        columns: {
          amount: true,
        },
      },
    },
  });
  return userInfo;
};

export const getAllCardRequests = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const cardRequests = await db
    .select({
      id: card.id,
      cardType: card.cardType,
      cardName: card.cardName,
      status: card.status,
      paymentStatus: card.paymentStatus,
      price: card.price,
      paymentReference: card.paymentReference,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      issuedAt: card.issuedAt,
      userId: card.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .orderBy(desc(card.createdAt));

  return cardRequests;
};

export const getPendingCardRequests = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const pendingRequests = await db
    .select({
      id: card.id,
      cardType: card.cardType,
      cardName: card.cardName,
      status: card.status,
      paymentStatus: card.paymentStatus,
      price: card.price,
      paymentReference: card.paymentReference,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      userId: card.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .where(eq(card.status, "pending"))
    .orderBy(desc(card.createdAt));

  return pendingRequests;
};

export const approveCardRequest = async (
  cardId: string,
  adminNotes?: string
) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(card)
      .set({
        status: "approved",
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(card.id, cardId));

    return {
      success: true,
      message: "Card request approved successfully",
    };
  } catch (error) {
    console.error("Error approving card request:", error);
    throw new Error("Failed to approve card request");
  }
};

export const rejectCardRequest = async (cardId: string, adminNotes: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(card)
      .set({
        status: "rejected",
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(card.id, cardId));

    return {
      success: true,
      message: "Card request rejected successfully",
    };
  } catch (error) {
    console.error("Error rejecting card request:", error);
    throw new Error("Failed to reject card request");
  }
};

export const issueCard = async (cardId: string, adminNotes?: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    await db
      .update(card)
      .set({
        status: "issued",
        cardNumber,
        cvv,
        expiryDate,
        issuedAt: new Date(),
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(card.id, cardId));

    return {
      success: true,
      message: "Card issued successfully",
      cardNumber,
      cvv,
      expiryDate,
    };
  } catch (error) {
    console.error("Error issuing card:", error);
    throw new Error("Failed to issue card");
  }
};

export const activateCard = async (cardId: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(card)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(card.id, cardId));

    return {
      success: true,
      message: "Card activated successfully",
    };
  } catch (error) {
    console.error("Error activating card:", error);
    throw new Error("Failed to activate card");
  }
};

export const suspendCard = async (cardId: string, adminNotes: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(card)
      .set({
        status: "suspended",
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(card.id, cardId));

    return {
      success: true,
      message: "Card suspended successfully",
    };
  } catch (error) {
    console.error("Error suspending card:", error);
    throw new Error("Failed to suspend card");
  }
};

export const getUserCards = async (userId: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const userCards = await db
    .select({
      id: card.id,
      cardType: card.cardType,
      cardName: card.cardName,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      status: card.status,
      price: card.price,
      paymentStatus: card.paymentStatus,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      issuedAt: card.issuedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .where(eq(card.userId, userId))
    .orderBy(desc(card.createdAt));

  return userCards;
};

export const newUserPassword = async (id: string, password: string) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const data = await auth.api.setUserPassword({
    body: {
      newPassword: password,
      userId: id,
    },
    headers: await headers(),
  });
  return data;
};

export const banUser = async (
  id: string,
  reason: string,
  expiresIn: number
) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await auth.api.banUser({
    body: {
      userId: id,
      banReason: reason,
      banExpiresIn: expiresIn,
    },
    headers: await headers(),
  });
};

export const unbanUser = async (id: string) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  await auth.api.unbanUser({
    body: {
      userId: id,
    },
    headers: await headers(),
  });
};

export const deleteUser = async (id: string) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const deletedUser = await auth.api.removeUser({
    body: {
      userId: id,
    },
    headers: await headers(),
  });
  return deletedUser;
};

export const updateUserBalance = async (
  userId: string,
  amount: string,
  actionType: "increase" | "reduce" | "set"
) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const currentBalance = await db.query.balance.findFirst({
    where: (balance, { eq }) => eq(balance.userId, userId),
  });

  if (!currentBalance) {
    throw new Error("User balance not found");
  }

  const currentAmount = parseFloat(currentBalance.amount);
  const changeAmount = parseFloat(amount);
  let newAmount: number;
  let transactionType: "deposit" | "withdrawal";
  let transactionAmount: string;
  let description: string;

  switch (actionType) {
    case "increase":
      newAmount = currentAmount + changeAmount;
      transactionType = "deposit";
      transactionAmount = changeAmount.toString();
      description = `Admin balance increase: +$${changeAmount.toFixed(2)}`;
      break;
    case "reduce":
      newAmount = currentAmount - changeAmount;
      transactionType = "withdrawal";
      transactionAmount = changeAmount.toString();
      description = `Admin balance reduction: -$${changeAmount.toFixed(2)}`;
      break;
    case "set":
      const difference = changeAmount - currentAmount;
      newAmount = changeAmount;
      transactionType = difference >= 0 ? "deposit" : "withdrawal";
      transactionAmount = Math.abs(difference).toString();
      description = `Admin balance adjustment: ${
        difference >= 0 ? "+" : "-"
      }$${Math.abs(difference).toFixed(2)}`;
      break;
    default:
      throw new Error("Invalid action type");
  }

  if (newAmount < 0) {
    throw new Error("Balance cannot be negative");
  }

  const transactionId = crypto.randomUUID();

  await db
    .update(balance)
    .set({
      amount: newAmount.toString(),
      updatedAt: new Date(),
    })
    .where(eq(balance.userId, userId));

  await db.insert(transaction).values({
    id: transactionId,
    userId,
    type: transactionType,
    amount: transactionAmount,
    currency: "USD",
    status: "success",
    description,
    reference: `ADMIN_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    success: true,
    newBalance: newAmount.toString(),
    transaction: {
      id: transactionId,
      type: transactionType,
      amount: transactionAmount,
      description,
    },
  };
};

export const updateUserInfo = async (
  userId: string,
  data: { name?: string; email?: string }
) => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await auth.api.updateUser({
    body: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
    },
    query: {
      userId,
    },
    headers: await headers(),
  });

  return { success: true };
};

export const seedFirstAdmin = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  console.log("seedFirstAdmin");
  const existingAdmins = await db.query.user.findMany({
    where: (user, { eq }) => eq(user.role, "admin"),
    limit: 1,
  });
  console.log("existingAdmins", existingAdmins);
  if (existingAdmins.length > 0) {
    throw new Error("Admin user already exists");
  }

  const accountNumber = generateAccountNumber();
  console.log("accountNumber", accountNumber);
  const newUser = await auth.api.createUser({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: "admin",
      data: {},
    },
  });
  console.log("newUser", newUser);

  const accountInfoId = crypto.randomUUID();
  const balanceId = crypto.randomUUID();

  await db.insert(accountInfo).values({
    id: accountInfoId,
    userId: newUser.user.id,
    accountNumber,
  });
  console.log("newAccountInfo created");

  await db.insert(balance).values({
    id: balanceId,
    userId: newUser.user.id,
    amount: "0",
    currency: "USD",
  });
  console.log("newBalance created");

  return {
    user: newUser.user,
    accountInfo: {
      id: accountInfoId,
      userId: newUser.user.id,
      accountNumber,
    },
    balance: {
      id: balanceId,
      userId: newUser.user.id,
      amount: "0",
      currency: "USD",
    },
  };
};
