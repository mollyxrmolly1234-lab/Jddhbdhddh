import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Smartphone, Wifi, History, Headphones, LogOut } from "lucide-react";
import type { User, Transaction } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
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

  // Fetch wallet balance (user already has walletBalance)
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/recent"],
    enabled: isAuthenticated,
  });

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Smartphone, title: "Buy Airtime", path: "/airtime", color: "text-primary" },
    { icon: Wifi, title: "Buy Data", path: "/data", color: "text-primary" },
    { icon: Wallet, title: "Fund Wallet", path: "/fund-wallet", color: "text-primary" },
    { icon: History, title: "Transactions", path: "/transactions", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-poppins text-2xl font-bold text-primary" data-testid="text-logo">
              XTRADATA
            </h1>
            <div className="flex items-center gap-4">
              <Link href="/support">
                <Button variant="ghost" size="icon" className="text-foreground" data-testid="button-support">
                  <Headphones className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/api/logout'}
                className="text-foreground"
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Wallet Balance Card */}
        <Card className="border-2 border-primary bg-gradient-to-br from-card to-card/50 p-8 mb-12 text-center" data-testid="card-wallet-balance">
          <p className="text-foreground/70 text-sm mb-2" data-testid="text-wallet-label">
            Wallet Balance
          </p>
          <h2 className="font-poppins text-6xl font-bold text-primary mb-4" data-testid="text-wallet-balance">
            ₦{parseFloat(userData?.walletBalance || "0").toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <Link href="/fund-wallet">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-fund-wallet">
              <Wallet className="mr-2 h-4 w-4" />
              Fund Wallet
            </Button>
          </Link>
        </Card>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="font-poppins text-xl font-semibold text-foreground mb-6" data-testid="text-quick-actions-title">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.path}>
                <Card className="border-2 border-primary/30 bg-card p-6 hover-elevate cursor-pointer transition-all" data-testid={`card-quick-action-${index}`}>
                  <action.icon className={`h-12 w-12 ${action.color} mb-3`} />
                  <h4 className="font-poppins font-semibold text-foreground" data-testid={`text-quick-action-title-${index}`}>
                    {action.title}
                  </h4>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-poppins text-xl font-semibold text-foreground" data-testid="text-recent-transactions-title">
              Recent Transactions
            </h3>
            <Link href="/transactions">
              <Button variant="ghost" className="text-primary" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </div>
          <Card className="border border-border bg-card" data-testid="card-recent-transactions">
            {transactionsLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="divide-y divide-border">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover-elevate" data-testid={`row-transaction-${index}`}>
                    <div>
                      <p className="font-semibold text-foreground" data-testid={`text-transaction-description-${index}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-foreground/60" data-testid={`text-transaction-date-${index}`}>
                        {new Date(transaction.createdAt!).toLocaleDateString('en-NG')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'funding' ? 'text-green-500' : 'text-red-500'}`} data-testid={`text-transaction-amount-${index}`}>
                        {transaction.type === 'funding' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString('en-NG')}
                      </p>
                      <p className="text-sm text-foreground/60" data-testid={`text-transaction-status-${index}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <History className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
                <p className="text-foreground/60" data-testid="text-no-transactions">
                  No transactions yet
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
