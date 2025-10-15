"use server";

import { serverAuth } from "@/lib/server-auth";
import { supportChat, supportMessage, user } from "@/db/schema";
import db from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Get all support chats for admin
export async function getAllSupportChats() {
  const currentUser = await serverAuth();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const chats = await db
    .select({
      id: supportChat.id,
      subject: supportChat.subject,
      status: supportChat.status,
      lastMessageAt: supportChat.lastMessageAt,
      createdAt: supportChat.createdAt,
      updatedAt: supportChat.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(supportChat)
    .innerJoin(user, eq(supportChat.userId, user.id))
    .orderBy(desc(supportChat.lastMessageAt));

  return chats;
}

// Get a specific support chat with messages
export async function getSupportChat(chatId: string) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Get chat details
  const chat = await db
    .select({
      id: supportChat.id,
      subject: supportChat.subject,
      status: supportChat.status,
      lastMessageAt: supportChat.lastMessageAt,
      createdAt: supportChat.createdAt,
      updatedAt: supportChat.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(supportChat)
    .innerJoin(user, eq(supportChat.userId, user.id))
    .where(eq(supportChat.id, chatId))
    .limit(1);

  if (!chat.length) {
    throw new Error("Chat not found");
  }

  // Check if user can access this chat
  if (currentUser.role !== "admin" && chat[0].user.id !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  // Get messages for this chat
  const messages = await db
    .select({
      id: supportMessage.id,
      content: supportMessage.content,
      senderType: supportMessage.senderType,
      isRead: supportMessage.isRead,
      createdAt: supportMessage.createdAt,
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(supportMessage)
    .innerJoin(user, eq(supportMessage.senderId, user.id))
    .where(eq(supportMessage.chatId, chatId))
    .orderBy(supportMessage.createdAt);

  return {
    ...chat[0],
    messages,
  };
}

// Get user's own support chats
export async function getUserSupportChats() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const chats = await db
    .select({
      id: supportChat.id,
      subject: supportChat.subject,
      status: supportChat.status,
      lastMessageAt: supportChat.lastMessageAt,
      createdAt: supportChat.createdAt,
      updatedAt: supportChat.updatedAt,
    })
    .from(supportChat)
    .where(eq(supportChat.userId, currentUser.id))
    .orderBy(desc(supportChat.lastMessageAt));

  return chats;
}

// Create a new support chat
export async function createSupportChat(
  subject: string,
  initialMessage: string
) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const chatId = nanoid();
  const messageId = nanoid();

  // Create chat first
  await db.insert(supportChat).values({
    id: chatId,
    userId: currentUser.id,
    subject,
    status: "open",
    lastMessageAt: new Date(),
  });

  // Create the first message
  await db.insert(supportMessage).values({
    id: messageId,
    chatId,
    senderId: currentUser.id,
    senderType: "user",
    content: initialMessage,
    isRead: false,
  });

  return chatId;
}

// Send a message to a support chat
export async function sendSupportMessage(chatId: string, content: string) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Verify chat exists and user has access
  const chat = await db
    .select()
    .from(supportChat)
    .where(eq(supportChat.id, chatId))
    .limit(1);

  if (!chat.length) {
    throw new Error("Chat not found");
  }

  if (currentUser.role !== "admin" && chat[0].userId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  const messageId = nanoid();
  const senderType = currentUser.role === "admin" ? "admin" : "user";

  // Create message
  await db.insert(supportMessage).values({
    id: messageId,
    chatId,
    senderId: currentUser.id,
    senderType,
    content,
    isRead: false,
  });

  // Update chat timestamp
  await db
    .update(supportChat)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supportChat.id, chatId));

  return messageId;
}

// Mark messages as read
export async function markMessagesAsRead(chatId: string, messageIds: string[]) {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Verify chat exists and user has access
  const chat = await db
    .select()
    .from(supportChat)
    .where(eq(supportChat.id, chatId))
    .limit(1);

  if (!chat.length) {
    throw new Error("Chat not found");
  }

  if (currentUser.role !== "admin" && chat[0].userId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  // Mark messages as read
  for (const messageId of messageIds) {
    await db
      .update(supportMessage)
      .set({ isRead: true })
      .where(
        and(eq(supportMessage.id, messageId), eq(supportMessage.chatId, chatId))
      );
  }
}

// Update chat status (admin only)
export async function updateChatStatus(
  chatId: string,
  status: "open" | "closed" | "pending"
) {
  const currentUser = await serverAuth();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(supportChat)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(supportChat.id, chatId));
}

// Get unread message count for user
export async function getUnreadMessageCount() {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  if (currentUser.role === "admin") {
    // For admin, count unread messages from users
    const result = await db
      .select({ count: supportMessage.id })
      .from(supportMessage)
      .innerJoin(supportChat, eq(supportMessage.chatId, supportChat.id))
      .where(
        and(
          eq(supportMessage.senderType, "user"),
          eq(supportMessage.isRead, false)
        )
      );

    return result.length;
  } else {
    // For users, count unread messages from admin
    const result = await db
      .select({ count: supportMessage.id })
      .from(supportMessage)
      .innerJoin(supportChat, eq(supportMessage.chatId, supportChat.id))
      .where(
        and(
          eq(supportChat.userId, currentUser.id),
          eq(supportMessage.senderType, "admin"),
          eq(supportMessage.isRead, false)
        )
      );

    return result.length;
  }
}
