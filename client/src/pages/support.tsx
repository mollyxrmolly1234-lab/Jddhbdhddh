import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Local AI chatbot responses - no external API needed
const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  // Wallet funding
  if (message.includes("fund") || message.includes("wallet") || message.includes("deposit")) {
    return "To fund your wallet:\n\n1. Go to 'Fund Wallet' from the dashboard\n2. Enter the amount (minimum ₦1,000)\n3. You'll see our OPAY account details:\n   • Account: 8168877628\n   • Bank: OPAY\n   • Name: ABOSEDE AJAYI\n4. Make the transfer\n5. Click 'I've made payment'\n\nYour wallet will be credited once payment is confirmed!";
  }

  // Minimum funding
  if (message.includes("minimum") && (message.includes("fund") || message.includes("amount"))) {
    return "The minimum wallet funding amount is ₦1,000. This ensures efficient processing of your transactions.";
  }

  // Airtime purchase
  if (message.includes("airtime") && (message.includes("buy") || message.includes("purchase") || message.includes("how"))) {
    return "To buy airtime:\n\n1. Click 'Buy Airtime' from your dashboard\n2. Select your network (MTN, Glo, Airtel, or 9mobile)\n3. Enter the phone number\n4. Enter the amount (minimum ₦50)\n5. Review the discount and click 'Buy Airtime'\n\nYou'll save money with our discounted rates!";
  }

  // Data purchase
  if (message.includes("data") && (message.includes("buy") || message.includes("purchase") || message.includes("how"))) {
    return "To buy data:\n\n1. Click 'Buy Data' from your dashboard\n2. Select your network\n3. Browse through categories: SME, Direct Data, Gifting, Corporate Gifting\n4. Choose your preferred data plan\n5. Enter phone number and confirm\n\nWe have extensive data plans at very cheap rates!";
  }

  // Data plans types
  if (message.includes("sme") || message.includes("direct") || message.includes("gifting") || message.includes("corporate")) {
    return "We offer different data plan types:\n\n• SME Data - Most affordable, great for regular use\n• Direct Data - Fast activation, reliable\n• Gifting Data - Can be gifted to others\n• Corporate Gifting - Bulk data for businesses\n\nEach type has different prices and validity periods. Check our Data Plans page to compare!";
  }

  // Transaction issues
  if (message.includes("transaction") || message.includes("payment") || message.includes("failed") || message.includes("pending")) {
    return "For transaction issues:\n\n• Pending: Wait 5-10 minutes for confirmation\n• Failed: Check your wallet balance and try again\n• Missing credit: Contact support with transaction details\n\nYou can view all transactions in 'Transaction History' from your dashboard.";
  }

  // Account/Login
  if (message.includes("account") || message.includes("login") || message.includes("sign")) {
    return "To access your account:\n\n1. Click 'Login' or 'Get Started' on the homepage\n2. Sign in with your preferred method (Google, GitHub, etc.)\n3. Your account is created automatically on first login\n\nYour wallet balance and transaction history are always saved!";
  }

  // Balance check
  if (message.includes("balance") || message.includes("check wallet")) {
    return "Your wallet balance is displayed prominently on your dashboard. You can also see it at the top of the Airtime and Data purchase pages.\n\nTo add funds, click 'Fund Wallet' from any page!";
  }

  // Navigation
  if (message.includes("where") || message.includes("find") || message.includes("navigate") || message.includes("go to")) {
    return "Quick navigation guide:\n\n• Dashboard - Main page with wallet balance\n• Fund Wallet - Add money to your account\n• Buy Airtime - Purchase airtime for any network\n• Buy Data - Browse and purchase data plans\n• Transactions - View your transaction history\n• Support - You're here! 😊";
  }

  // Discount/Savings
  if (message.includes("discount") || message.includes("save") || message.includes("cheap") || message.includes("rate")) {
    return "We offer the cheapest rates in Nigeria! 🎉\n\n• Airtime: Save 2-5% on all networks\n• Data: Save up to 15% on SME and other plans\n\nYou can see the exact discount percentage and savings amount before each purchase.";
  }

  // Networks
  if (message.includes("network") || message.includes("mtn") || message.includes("glo") || message.includes("airtel") || message.includes("9mobile")) {
    return "We support all major Nigerian networks:\n\n• MTN\n• Glo\n• Airtel\n• 9mobile\n\nAll networks have discounted airtime and extensive data plans available!";
  }

  // Customer support
  if (message.includes("help") || message.includes("support") || message.includes("contact") || message.includes("issue")) {
    return "I'm here to help! You can ask me about:\n\n• Wallet funding\n• Buying airtime\n• Purchasing data\n• Transaction issues\n• Account management\n• Navigation help\n• Discount rates\n\nJust type your question and I'll assist you!";
  }

  // Greeting
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! 👋 Welcome to XTRADATA support!\n\nI'm here to help you with:\n• Wallet funding\n• Airtime & data purchases\n• Transaction queries\n• Account questions\n\nWhat would you like to know?";
  }

  // Default response
  return "I'm here to help! Here are some things I can assist you with:\n\n• How to fund your wallet\n• Buying airtime and data\n• Understanding data plan types (SME, Direct, etc.)\n• Transaction issues\n• Account and navigation help\n• Discount rates and savings\n\nPlease ask me a specific question about any of these topics!";
};

export default function Support() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 Welcome to XTRADATA support! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Get bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-poppins text-xl font-bold text-primary" data-testid="text-page-title">
                  Customer Support AI
                </h1>
                <p className="text-xs text-foreground/60">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-4xl w-full px-6 py-6">
        <Card className="border-2 border-primary/30 bg-card h-[calc(100vh-250px)] flex flex-col" data-testid="card-chat">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.sender}-${message.id}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === "user"
                        ? "bg-background text-foreground border-2 border-foreground/20"
                        : "bg-primary/10 text-foreground border-2 border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.sender === "bot" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-foreground" />
                      )}
                      <span className="text-xs text-foreground/60">
                        {message.sender === "bot" ? "AI Assistant" : "You"}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm" data-testid={`text-message-content-${message.id}`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="bg-input border-border text-foreground"
                data-testid="input-message"
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
