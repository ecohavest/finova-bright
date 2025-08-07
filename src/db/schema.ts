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

export const card = pgTable("card", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  cardType: cardTypeEnum("card_type").notNull(),
  cardName: text("card_name").notNull(),
  cardNumber: text("card_number"),
  expiryDate: text("expiry_date"),
  cvv: text("cvv"),
  status: cardStatusEnum("status")
    .$defaultFn(() => "pending")
    .notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
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
  transactions: many(transaction),
  sentTransactions: many(transaction, { relationName: "sender" }),
  cards: many(card),
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

export const cardRelations = relations(card, ({ one }) => ({
  user: one(user, {
    fields: [card.userId],
    references: [user.id],
  }),
}));
