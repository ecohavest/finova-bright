"use server";

import { auth } from "@/lib/auth";
import {
  balance,
  accountInfo,
  transaction,
  card,
  paymentAccount,
  cardProduct,
  user,
  kyc,
} from "@/db/schema";
import db from "@/db";
import { serverAuth } from "@/lib/server-auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { sendWelcomeEmail } from "@/actions/mail";

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
      cardProductId: card.cardProductId,
      status: card.status,
      paymentStatus: card.paymentStatus,
      paymentReference: card.paymentReference,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      issuedAt: card.issuedAt,
      userId: card.userId,
      userName: user.name,
      userEmail: user.email,
      cardProductName: cardProduct.name,
      cardProductType: cardProduct.type,
      cardProductPrice: cardProduct.price,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .leftJoin(cardProduct, eq(card.cardProductId, cardProduct.id))
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
      cardProductId: card.cardProductId,
      status: card.status,
      paymentStatus: card.paymentStatus,
      paymentReference: card.paymentReference,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      userId: card.userId,
      userName: user.name,
      userEmail: user.email,
      cardProductName: cardProduct.name,
      cardProductType: cardProduct.type,
      cardProductPrice: cardProduct.price,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .leftJoin(cardProduct, eq(card.cardProductId, cardProduct.id))
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
      cardProductId: card.cardProductId,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      status: card.status,
      paymentStatus: card.paymentStatus,
      adminNotes: card.adminNotes,
      createdAt: card.createdAt,
      issuedAt: card.issuedAt,
      userName: user.name,
      userEmail: user.email,
      cardProductName: cardProduct.name,
      cardProductType: cardProduct.type,
      cardProductPrice: cardProduct.price,
    })
    .from(card)
    .leftJoin(user, eq(card.userId, user.id))
    .leftJoin(cardProduct, eq(card.cardProductId, cardProduct.id))
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

export const getAllKycSubmissions = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const records = await db
    .select({
      id: kyc.id,
      userId: kyc.userId,
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      dateOfBirth: kyc.dateOfBirth,
      addressLine1: kyc.addressLine1,
      addressLine2: kyc.addressLine2,
      city: kyc.city,
      state: kyc.state,
      postalCode: kyc.postalCode,
      country: kyc.country,
      documentType: kyc.documentType,
      documentNumber: kyc.documentNumber,
      status: kyc.status,
      adminNotes: kyc.adminNotes,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(kyc)
    .leftJoin(user, eq(kyc.userId, user.id))
    .orderBy(desc(kyc.createdAt));

  return records;
};

export const getPendingKycSubmissions = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const records = await db
    .select({
      id: kyc.id,
      userId: kyc.userId,
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      documentType: kyc.documentType,
      documentNumber: kyc.documentNumber,
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(kyc)
    .leftJoin(user, eq(kyc.userId, user.id))
    .where(eq(kyc.status, "pending"))
    .orderBy(desc(kyc.createdAt));

  return records;
};

export const approveKycSubmission = async (
  kycId: string,
  adminNotes?: string
) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const data = await db.query.kyc.findFirst({
    where: eq(kyc.id, kycId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
        with: {
          accountInfo: {
            columns: {
              accountNumber: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    console.error("KYC not found");
    throw new Error("KYC not found");
  }

  await db
    .update(kyc)
    .set({
      status: "approved",
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(kyc.id, kycId));

  sendWelcomeEmail(
    data.user.email,
    data.user.name,
    data.user.accountInfo?.accountNumber || ""
  );

  return {
    success: true,
    message: "KYC approved successfully and Welcome email fired",
  } as const;
};

export const rejectKycSubmission = async (
  kycId: string,
  adminNotes: string
) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(kyc)
    .set({
      status: "rejected",
      adminNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(kyc.id, kycId));

  return { success: true, message: "KYC rejected" } as const;
};

export const seedCardProducts = async () => {
  const user = await serverAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const existingProducts = await db.query.cardProduct.findMany({
    limit: 1,
  });

  if (existingProducts.length > 0) {
    throw new Error("Card products already exist");
  }

  const cardProducts = [
    {
      id: "classic-debit",
      name: "Classic Debit",
      type: "classic-debit" as const,
      description: "Perfect for everyday spending and ATM withdrawals",
      price: "10.00",
      features: JSON.stringify([
        "Free transactions",
        "ATM access",
        "Online shopping",
      ]),
      gradient: "from-slate-700 to-slate-900",
      icon: "CreditCard",
      dailyLimit: "1000.00",
      monthlyLimit: "5000.00",
      withdrawalLimit: "500.00",
      status: "active" as const,
      sortOrder: "1",
    },
    {
      id: "premium-debit",
      name: "Premium Debit",
      type: "premium-debit" as const,
      description: "Enhanced features for frequent users",
      price: "20.00",
      features: JSON.stringify([
        "Priority support",
        "Higher limits",
        "Travel insurance",
        "Cashback rewards",
      ]),
      gradient: "from-blue-600 to-blue-900",
      icon: "Zap",
      dailyLimit: "5000.00",
      monthlyLimit: "25000.00",
      withdrawalLimit: "2000.00",
      status: "active" as const,
      sortOrder: "2",
    },
    {
      id: "gold-credit",
      name: "Gold Credit",
      type: "gold-credit" as const,
      description: "Build credit while earning rewards",
      price: "50.00",
      features: JSON.stringify([
        "Credit facility",
        "Rewards program",
        "Purchase protection",
        "Extended warranty",
      ]),
      gradient: "from-yellow-500 to-yellow-700",
      icon: "Star",
      dailyLimit: "10000.00",
      monthlyLimit: "50000.00",
      withdrawalLimit: "5000.00",
      status: "active" as const,
      sortOrder: "3",
    },
    {
      id: "platinum-credit",
      name: "Platinum Credit",
      type: "platinum-credit" as const,
      description: "Ultimate luxury and convenience",
      price: "100.00",
      features: JSON.stringify([
        "Premium credit line",
        "Concierge service",
        "Airport lounge access",
        "Travel benefits",
      ]),
      gradient: "from-purple-600 to-purple-900",
      icon: "Shield",
      dailyLimit: null, // No limit
      monthlyLimit: null, // No limit
      withdrawalLimit: null, // No limit
      status: "active" as const,
      sortOrder: "4",
    },
  ];

  await db.insert(cardProduct).values(cardProducts);

  return {
    success: true,
    message: "Card products seeded successfully",
    count: cardProducts.length,
  };
};

export const getCardProducts = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const products = await db.query.cardProduct.findMany({
    orderBy: [cardProduct.sortOrder, cardProduct.createdAt],
  });

  return products;
};

export const getActiveCardProducts = async () => {
  const products = await db.query.cardProduct.findMany({
    where: eq(cardProduct.status, "active"),
    orderBy: [cardProduct.sortOrder, cardProduct.createdAt],
  });

  return products;
};

export const createCardProduct = async (data: {
  name: string;
  type: "classic-debit" | "premium-debit" | "gold-credit" | "platinum-credit";
  description: string;
  price: string;
  features: string[];
  gradient: string;
  icon: string;
  dailyLimit?: string | null;
  monthlyLimit?: string | null;
  withdrawalLimit?: string | null;
  sortOrder?: string;
}) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const id = crypto.randomUUID();

  await db.insert(cardProduct).values({
    id,
    name: data.name,
    type: data.type,
    description: data.description,
    price: data.price,
    features: JSON.stringify(data.features),
    gradient: data.gradient,
    icon: data.icon,
    dailyLimit: data.dailyLimit,
    monthlyLimit: data.monthlyLimit,
    withdrawalLimit: data.withdrawalLimit,
    sortOrder: data.sortOrder || "0",
    status: "active",
  });

  return {
    success: true,
    message: "Card product created successfully",
    productId: id,
  };
};

export const updateCardProduct = async (
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: string;
    features?: string[];
    gradient?: string;
    icon?: string;
    dailyLimit?: string | null;
    monthlyLimit?: string | null;
    withdrawalLimit?: string | null;
    sortOrder?: string;
    status?: "active" | "inactive";
  }
) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.price) updateData.price = data.price;
  if (data.features) updateData.features = JSON.stringify(data.features);
  if (data.gradient) updateData.gradient = data.gradient;
  if (data.icon) updateData.icon = data.icon;
  if (data.dailyLimit !== undefined) updateData.dailyLimit = data.dailyLimit;
  if (data.monthlyLimit !== undefined)
    updateData.monthlyLimit = data.monthlyLimit;
  if (data.withdrawalLimit !== undefined)
    updateData.withdrawalLimit = data.withdrawalLimit;
  if (data.sortOrder) updateData.sortOrder = data.sortOrder;
  if (data.status) updateData.status = data.status;

  await db
    .update(cardProduct)
    .set(updateData)
    .where(eq(cardProduct.id, productId));

  return {
    success: true,
    message: "Card product updated successfully",
  };
};

export const deleteCardProduct = async (productId: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Check if any cards are using this product
  const existingCards = await db.query.card.findMany({
    where: eq(card.cardProductId, productId),
    limit: 1,
  });

  if (existingCards.length > 0) {
    throw new Error(
      "Cannot delete card product that is in use by existing cards"
    );
  }

  await db.delete(cardProduct).where(eq(cardProduct.id, productId));

  return {
    success: true,
    message: "Card product deleted successfully",
  };
};

// Payment Accounts CRUD (bank/wire, paypal, crypto)

export const getPaymentAccounts = async () => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const accounts = await db.query.paymentAccount.findMany({
    orderBy: [paymentAccount.sortOrder, paymentAccount.createdAt],
  });

  return accounts;
};

export const getActivePaymentAccounts = async () => {
  const accounts = await db.query.paymentAccount.findMany({
    where: eq(paymentAccount.status, "active"),
    orderBy: [paymentAccount.sortOrder, paymentAccount.createdAt],
  });

  return accounts;
};

export const createPaymentAccount = async (data: {
  type: "bank" | "paypal" | "crypto";
  label: string;
  currency?: string;
  details: Record<string, string>;
  instructions?: string;
  sortOrder?: string;
  status?: "active" | "inactive";
}) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const id = crypto.randomUUID();

  await db.insert(paymentAccount).values({
    id,
    type: data.type,
    label: data.label,
    currency: data.currency || "USD",
    details: JSON.stringify(data.details),
    instructions: data.instructions || null,
    sortOrder: data.sortOrder || "0",
    status: data.status || "active",
  });

  return { success: true, message: "Payment account created", id } as const;
};

export const updatePaymentAccount = async (
  id: string,
  data: {
    type?: "bank" | "paypal" | "crypto";
    label?: string;
    currency?: string;
    details?: Record<string, string>;
    instructions?: string | null;
    sortOrder?: string;
    status?: "active" | "inactive";
  }
) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.type) updateData.type = data.type;
  if (data.label) updateData.label = data.label;
  if (data.currency) updateData.currency = data.currency;
  if (data.details) updateData.details = JSON.stringify(data.details);
  if (data.instructions !== undefined)
    updateData.instructions = data.instructions;
  if (data.sortOrder) updateData.sortOrder = data.sortOrder;
  if (data.status) updateData.status = data.status;

  await db
    .update(paymentAccount)
    .set(updateData)
    .where(eq(paymentAccount.id, id));

  return { success: true, message: "Payment account updated" } as const;
};

export const deletePaymentAccount = async (id: string) => {
  const adminUser = await serverAuth();
  if (!adminUser || adminUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Soft check: if any pending cards reference it, allow delete but apps should handle null
  await db.delete(paymentAccount).where(eq(paymentAccount.id, id));
  return { success: true, message: "Payment account deleted" } as const;
};
