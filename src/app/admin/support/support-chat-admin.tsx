"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, RefreshCw, Send, User, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  getAllSupportChats,
  getSupportChat,
  sendSupportMessage,
  markMessagesAsRead,
  updateChatStatus,
  getUnreadMessageCount,
} from "@/actions/support";

interface Message {
  id: string;
  content: string;
  senderType: "user" | "admin";
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

interface Chat {
  id: string;
  subject: string;
  status: "open" | "closed" | "pending";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  messages?: Message[];
}

export function SupportChatAdmin() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setIsUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const allChats = await getAllSupportChats();
      setChats(
        allChats.map((chat) => ({
          ...chat,
          lastMessageAt: chat.lastMessageAt.toISOString(),
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        }))
      );

      const unread = await getUnreadMessageCount();
      setIsUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  const [showChatList, setShowChatList] = useState(true);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      const chat = await getSupportChat(chatId);
      setSelectedChat({
        ...chat,
        lastMessageAt: chat.lastMessageAt.toISOString(),
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        messages: chat.messages?.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toISOString(),
        })),
      });

      // Mark messages as read
      const unreadMessages =
        chat.messages
          ?.filter((msg) => msg.senderType === "user" && !msg.isRead)
          .map((msg) => msg.id) || [];

      if (unreadMessages.length > 0) {
        await markMessagesAsRead(chatId, unreadMessages);
        await loadChats(); // Refresh chats to update unread count
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast.error("Failed to load chat");
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      await sendSupportMessage(selectedChat.id, newMessage.trim());
      setNewMessage("");
      await loadChat(selectedChat.id);
      await loadChats(); // Refresh chats list
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (
    chatId: string,
    status: "open" | "closed" | "pending"
  ) => {
    try {
      await updateChatStatus(chatId, status);
      await loadChats();
      if (selectedChat?.id === chatId) {
        await loadChat(chatId);
      }
      toast.success("Chat status updated");
    } catch (error) {
      console.error("Failed to update chat status:", error);
      toast.error("Failed to update chat status");
    }
  };

  const handleRefresh = () => {
    loadChats();
    if (selectedChat) {
      loadChat(selectedChat.id);
    }
  };

  // Auto-refresh every 15 seconds for admin
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadChats();
      if (selectedChat) {
        loadChat(selectedChat.id);
      }
    }, 15000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedChat, loadChat]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (statusFilter === "all") return true;
    return chat.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[700px] gap-4">
      {/* Chats List */}
      <Card
        className={`w-full md:w-96 ${!showChatList ? "hidden md:block" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Support Chats
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chats</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] md:h-[580px]">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No support chats found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedChat?.id === chat.id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      loadChat(chat.id);
                      setShowChatList(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate flex-1">
                        {chat.subject}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            chat.status
                          )}`}
                        />
                        <Badge
                          variant={
                            chat.status === "open"
                              ? "default"
                              : chat.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {chat.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{chat.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(chat.lastMessageAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          {selectedChat ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatList(true)}
                    className="p-1 h-8 w-8"
                  >
                    ←
                  </Button>
                  <CardTitle className="text-lg truncate">
                    {selectedChat.subject}
                  </CardTitle>
                </div>
                <CardTitle className="text-lg hidden md:block">
                  {selectedChat.subject}
                </CardTitle>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{selectedChat.user.name}</span>
                    <span className="hidden md:inline">
                      ({selectedChat.user.email})
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Select
                      value={selectedChat.status}
                      onValueChange={(value: "open" | "closed" | "pending") =>
                        updateStatus(selectedChat.id, value)
                      }
                    >
                      <SelectTrigger className="w-20 md:w-24 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="hidden md:flex"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="md:hidden p-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          ) : (
            <CardTitle className="text-lg">
              Select a chat to view messages
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex flex-col h-[500px] md:h-[580px] p-0">
          {selectedChat ? (
            <>
              <ScrollArea className="flex-1 p-2 md:p-4">
                <div className="space-y-4">
                  {selectedChat.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                          message.senderType === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === "admin"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.senderType === "admin"
                            ? "You"
                            : message.sender.name}{" "}
                          • {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <Separator />
              <div className="p-2 md:p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isSending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="hidden md:block">
                  Select a chat from the sidebar to view messages
                </p>
                <p className="md:hidden">
                  Select a chat from the list to view messages
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
