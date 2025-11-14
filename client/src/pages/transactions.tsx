import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'funding':
        return '💰';
      case 'airtime':
        return '📱';
      case 'data':
        return '📡';
      default:
        return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-poppins text-2xl font-bold text-primary" data-testid="text-page-title">
              Transaction History
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Card className="border-2 border-primary/30 bg-card p-6 mb-8" data-testid="card-filters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-foreground/50" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-input border-border text-foreground" data-testid="select-filter">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="funding">Wallet Funding</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card" data-testid="card-transactions-list">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="p-6 hover-elevate transition-all"
                  data-testid={`row-transaction-${index}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl" data-testid={`icon-transaction-${index}`}>
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-poppins font-semibold text-foreground" data-testid={`text-transaction-description-${index}`}>
                            {transaction.description}
                          </h3>
                          <Badge className={`${getStatusColor(transaction.status)} text-white`} data-testid={`badge-transaction-status-${index}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/60 mb-2" data-testid={`text-transaction-date-${index}`}>
                          {new Date(transaction.createdAt!).toLocaleString('en-NG', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                        {transaction.metadata && (
                          <div className="flex gap-4 text-sm text-foreground/70">
                            {(transaction.metadata as any).network && (
                              <span>Network: {(transaction.metadata as any).network}</span>
                            )}
                            {(transaction.metadata as any).phoneNumber && (
                              <span>Phone: {(transaction.metadata as any).phoneNumber}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-poppins text-xl font-bold ${
                          transaction.type === 'funding'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                        data-testid={`text-transaction-amount-${index}`}
                      >
                        {transaction.type === 'funding' ? '+' : '-'}₦
                        {parseFloat(transaction.amount).toLocaleString('en-NG', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-2">
                No Transactions Found
              </h3>
              <p className="text-foreground/60" data-testid="text-no-transactions">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Start by funding your wallet or making a purchase"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
