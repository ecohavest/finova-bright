"use server";

import { auth } from "@/lib/auth";
import { balance, accountInfo, transaction } from "@/db/schema";
import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const generateAccountNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ACC${timestamp}${random}`;
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
      banReason: reason, // e.g "Spamming"
      banExpiresIn: expiresIn, //e.g. 60 * 60 * 24 * 7 for 7 days
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
