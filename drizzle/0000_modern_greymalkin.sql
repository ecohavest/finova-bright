CREATE TYPE "public"."card_product_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."card_status" AS ENUM('pending', 'approved', 'rejected', 'issued', 'active', 'suspended', 'expired');--> statement-breakpoint
CREATE TYPE "public"."card_type" AS ENUM('classic-debit', 'premium-debit', 'gold-credit', 'platinum-credit');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('unsubmitted', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."message_sender" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."payment_account_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."payment_account_type" AS ENUM('bank', 'paypal', 'crypto');--> statement-breakpoint
CREATE TYPE "public"."support_chat_status" AS ENUM('open', 'closed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'success', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('transfer_in', 'transfer_out', 'received', 'deposit', 'withdrawal');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_info" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_number" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "account_info_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "account_info_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "balance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_product_id" text NOT NULL,
	"payment_account_id" text,
	"card_number" text,
	"expiry_date" text,
	"cvv" text,
	"status" "card_status" NOT NULL,
	"payment_reference" text,
	"payment_status" text,
	"admin_notes" text,
	"issued_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "card_type" NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"features" text NOT NULL,
	"gradient" text NOT NULL,
	"icon" text NOT NULL,
	"daily_limit" numeric(10, 2),
	"monthly_limit" numeric(10, 2),
	"withdrawal_limit" numeric(10, 2),
	"status" "card_product_status" NOT NULL,
	"sort_order" numeric(3, 0) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"document_type" text NOT NULL,
	"document_number" text NOT NULL,
	"status" "kyc_status" NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp,
	"reviewed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "kyc_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payment_account" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "payment_account_type" NOT NULL,
	"label" text NOT NULL,
	"currency" text,
	"details" text NOT NULL,
	"instructions" text,
	"status" "payment_account_status" NOT NULL,
	"sort_order" numeric(4, 0) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "support_chat" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"status" "support_chat_status" NOT NULL,
	"last_message_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_message" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"sender_type" "message_sender" NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sender_id" text,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"currency" text NOT NULL,
	"status" "transaction_status" NOT NULL,
	"description" text,
	"reference" text,
	"external_reference" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_info" ADD CONSTRAINT "account_info_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance" ADD CONSTRAINT "balance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_card_product_id_card_product_id_fk" FOREIGN KEY ("card_product_id") REFERENCES "public"."card_product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_chat" ADD CONSTRAINT "support_chat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_chat_id_support_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."support_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;