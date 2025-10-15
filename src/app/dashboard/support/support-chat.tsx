"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Plus, RefreshCw, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getUserSupportChats,
  getSupportChat,
  createSupportChat,
  sendSupportMessage,
  markMessagesAsRead,
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
  messages?: Message[];
}

export function SupportChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const userChats = await getUserSupportChats();
      setChats(
        userChats.map((chat) => ({
          ...chat,
          lastMessageAt: chat.lastMessageAt.toISOString(),
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        }))
      );

      const unread = await getUnreadMessageCount();
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

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
          ?.filter((msg) => msg.senderType === "admin" && !msg.isRead)
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

  const [showChatList, setShowChatList] = useState(true);

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

  const createNewChat = async () => {
    if (!newChatSubject.trim() || !newChatMessage.trim() || isCreatingChat)
      return;

    setIsCreatingChat(true);
    try {
      const chatId = await createSupportChat(
        newChatSubject.trim(),
        newChatMessage.trim()
      );
      setNewChatSubject("");
      setNewChatMessage("");
      setIsNewChatOpen(false);
      await loadChats();
      await loadChat(chatId);
      toast.success("New support chat created");
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleRefresh = () => {
    loadChats();
    if (selectedChat) {
      loadChat(selectedChat.id);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadChats();
      if (selectedChat) {
        loadChat(selectedChat.id);
      }
    }, 30000);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[600px] gap-4">
      {/* Chats List */}
      <Card
        className={`w-full md:w-80 ${!showChatList ? "hidden md:block" : ""}`}
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
            <div className="flex gap-2">
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
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 max-w-sm sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newChatSubject}
                        onChange={(e) => setNewChatSubject(e.target.value)}
                        placeholder="What can we help you with?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Describe your issue..."
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={createNewChat}
                      disabled={
                        isCreatingChat ||
                        !newChatSubject.trim() ||
                        !newChatMessage.trim()
                      }
                      className="w-full"
                    >
                      {isCreatingChat ? "Creating..." : "Start Chat"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] md:h-[500px]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No support chats yet. Start a new conversation!
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
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
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {chat.subject}
                      </h4>
                      <Badge
                        variant={
                          chat.status === "open"
                            ? "default"
                            : chat.status === "closed"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {chat.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(chat.lastMessageAt)}
                    </p>
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
                <p className="text-sm text-muted-foreground">
                  Status: <Badge variant="outline">{selectedChat.status}</Badge>
                </p>
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
        <CardContent className="flex flex-col h-[400px] md:h-[500px] p-0">
          {selectedChat ? (
            <>
              <ScrollArea className="flex-1 p-2 md:p-4">
                <div className="space-y-4">
                  {selectedChat.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                          message.senderType === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.senderType === "admin" ? "Support" : "You"} •{" "}
                          {formatTime(message.createdAt)}
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
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={selectedChat.status === "closed" || isSending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={
                      !newMessage.trim() ||
                      selectedChat.status === "closed" ||
                      isSending
                    }
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {selectedChat.status === "closed" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This chat has been closed. Start a new chat for further
                    assistance.
                  </p>
                )}
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
