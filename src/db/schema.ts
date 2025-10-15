import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const accountInfo = pgTable("account_info", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  accountNumber: text("account_number").notNull().unique(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const transactionTypeEnum = pgEnum("transaction_type", [
  "transfer_in",
  "transfer_out",
  "received",
  "deposit",
  "withdrawal",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "success",
  "failed",
  "refunded",
  "cancelled",
]);

export const cardTypeEnum = pgEnum("card_type", [
  "classic-debit",
  "premium-debit",
  "gold-credit",
  "platinum-credit",
]);

export const cardStatusEnum = pgEnum("card_status", [
  "pending",
  "approved",
  "rejected",
  "issued",
  "active",
  "suspended",
  "expired",
]);

export const paymentAccountTypeEnum = pgEnum("payment_account_type", [
  "bank",
  "paypal",
  "crypto",
]);

export const paymentAccountStatusEnum = pgEnum("payment_account_status", [
  "active",
  "inactive",
]);

export const cardProductStatusEnum = pgEnum("card_product_status", [
  "active",
  "inactive",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "unsubmitted",
  "pending",
  "approved",
  "rejected",
]);

export const supportChatStatusEnum = pgEnum("support_chat_status", [
  "open",
  "closed",
  "pending",
]);

export const messageSenderEnum = pgEnum("message_sender", ["user", "admin"]);

export const balance = pgTable("balance", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 19, scale: 4 })
    .$defaultFn(() => "0.0000")
    .notNull(),
  currency: text("currency")
    .$defaultFn(() => "USD")
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const kyc = pgTable("kyc", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  status: kycStatusEnum("status")
    .$defaultFn(() => "pending")
    .notNull(),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => user.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
  currency: text("currency")
    .$defaultFn(() => "USD")
    .notNull(),
  status: transactionStatusEnum("status")
    .$defaultFn(() => "pending")
    .notNull(),
  description: text("description"),
  reference: text("reference"),
  externalReference: text("external_reference"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const cardProduct = pgTable("card_product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: cardTypeEnum("type").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").notNull(), // JSON string array
  gradient: text("gradient").notNull(),
  icon: text("icon").notNull(),
  dailyLimit: decimal("daily_limit", { precision: 10, scale: 2 }),
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }),
  withdrawalLimit: decimal("withdrawal_limit", { precision: 10, scale: 2 }),
  status: cardProductStatusEnum("status")
    .$defaultFn(() => "active")
    .notNull(),
  sortOrder: decimal("sort_order", { precision: 3, scale: 0 })
    .$defaultFn(() => "0")
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const card = pgTable("card", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cardProductId: text("card_product_id")
    .notNull()
    .references(() => cardProduct.id, { onDelete: "restrict" }),
  paymentAccountId: text("payment_account_id"),
  cardNumber: text("card_number"),
  expiryDate: text("expiry_date"),
  cvv: text("cvv"),
  status: cardStatusEnum("status")
    .$defaultFn(() => "pending")
    .notNull(),
  paymentReference: text("payment_reference"),
  paymentStatus: text("payment_status").$defaultFn(() => "pending"),
  adminNotes: text("admin_notes"),
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  accountInfo: one(accountInfo),
  balance: one(balance),
  kyc: one(kyc),
  transactions: many(transaction),
  sentTransactions: many(transaction, { relationName: "sender" }),
  cards: many(card),
  supportChats: many(supportChat),
  supportMessages: many(supportMessage),
}));

export const accountInfoRelations = relations(accountInfo, ({ one }) => ({
  user: one(user, {
    fields: [accountInfo.userId],
    references: [user.id],
  }),
}));

export const balanceRelations = relations(balance, ({ one }) => ({
  user: one(user, {
    fields: [balance.userId],
    references: [user.id],
  }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  sender: one(user, {
    fields: [transaction.senderId],
    references: [user.id],
    relationName: "sender",
  }),
}));

export const cardProductRelations = relations(cardProduct, ({ many }) => ({
  cards: many(card),
}));

export const cardRelations = relations(card, ({ one }) => ({
  user: one(user, {
    fields: [card.userId],
    references: [user.id],
  }),
  cardProduct: one(cardProduct, {
    fields: [card.cardProductId],
    references: [cardProduct.id],
  }),
}));

export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(user, {
    fields: [kyc.userId],
    references: [user.id],
  }),
}));

// Payment Accounts that users can send payments to (for card requests, etc.)
export const paymentAccount = pgTable("payment_account", {
  id: text("id").primaryKey(),
  type: paymentAccountTypeEnum("type").notNull(),
  label: text("label").notNull(),
  currency: text("currency").$defaultFn(() => "USD"),
  // JSON string containing type-specific details (e.g. bank/wire fields, paypal email, crypto address/network)
  details: text("details").notNull(),
  instructions: text("instructions"),
  status: paymentAccountStatusEnum("status")
    .$defaultFn(() => "active")
    .notNull(),
  sortOrder: decimal("sort_order", { precision: 4, scale: 0 })
    .$defaultFn(() => "0")
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Support Chat System
export const supportChat = pgTable("support_chat", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: supportChatStatusEnum("status")
    .$defaultFn(() => "open")
    .notNull(),
  lastMessageAt: timestamp("last_message_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const supportMessage = pgTable("support_message", {
  id: text("id").primaryKey(),
  chatId: text("chat_id")
    .notNull()
    .references(() => supportChat.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  senderType: messageSenderEnum("sender_type").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const supportChatRelations = relations(supportChat, ({ one, many }) => ({
  user: one(user, {
    fields: [supportChat.userId],
    references: [user.id],
  }),
  messages: many(supportMessage),
}));

export const supportMessageRelations = relations(supportMessage, ({ one }) => ({
  chat: one(supportChat, {
    fields: [supportMessage.chatId],
    references: [supportChat.id],
  }),
  sender: one(user, {
    fields: [supportMessage.senderId],
    references: [user.id],
  }),
}));
