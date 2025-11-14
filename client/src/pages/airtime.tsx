import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { AirtimePlan, User } from "@shared/schema";

const networks = [
  { name: "MTN", color: "bg-yellow-500" },
  { name: "Glo", color: "bg-green-500" },
  { name: "Airtel", color: "bg-red-500" },
  { name: "9mobile", color: "bg-emerald-500" },
];

export default function Airtime() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

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

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const { data: plans } = useQuery<AirtimePlan[]>({
    queryKey: ["/api/airtime/plans"],
    enabled: isAuthenticated,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: { network: string; phoneNumber: string; amount: number }) => {
      return await apiRequest("POST", "/api/airtime/purchase", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      toast({
        title: "Success!",
        description: "Airtime purchased successfully",
      });
      setPhoneNumber("");
      setAmount("");
      setSelectedNetwork("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNetwork) {
      toast({
        title: "Select Network",
        description: "Please select a network provider",
        variant: "destructive",
      });
      return;
    }

    if (phoneNumber.length !== 11) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 11 digits",
        variant: "destructive",
      });
      return;
    }

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount < 50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum airtime is ₦50",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate({
      network: selectedNetwork,
      phoneNumber,
      amount: purchaseAmount,
    });
  };

  const networkPlans = plans?.filter(p => p.network === selectedNetwork) || [];
  const discount = networkPlans.length > 0 ? networkPlans[0].discount : 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-poppins text-2xl font-bold text-primary" data-testid="text-page-title">
              Buy Airtime
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card className="border border-primary/30 bg-card/50 p-6 mb-8" data-testid="card-wallet-info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/70 text-sm">Wallet Balance</p>
              <p className="font-poppins text-2xl font-bold text-primary" data-testid="text-wallet-balance">
                ₦{parseFloat(user?.walletBalance || "0").toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Link href="/fund-wallet">
              <Button variant="outline" className="border-primary text-primary" data-testid="button-fund">
                Fund Wallet
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-2 border-primary/30 bg-card p-8" data-testid="card-purchase-form">
          <h2 className="font-poppins text-xl font-semibold text-foreground mb-6">
            Select Network
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {networks.map((network) => (
              <button
                key={network.name}
                onClick={() => setSelectedNetwork(network.name)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedNetwork === network.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover-elevate'
                }`}
                data-testid={`button-network-${network.name.toLowerCase()}`}
              >
                <div className={`h-12 w-12 ${network.color} rounded-full mx-auto mb-3`} />
                <p className="font-semibold text-foreground text-center">{network.name}</p>
                {selectedNetwork === network.name && (
                  <Badge className="mt-2 bg-primary text-primary-foreground">
                    {discount}% OFF
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-foreground mb-2">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                className="bg-input border-border text-foreground"
                data-testid="input-phone"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground mb-2">
                Amount (₦)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="50"
                step="50"
                className="bg-input border-border text-foreground"
                data-testid="input-amount"
              />
              <p className="text-sm text-foreground/60 mt-2">
                Minimum: ₦50 • You save {discount}%
              </p>
            </div>

            {amount && parseFloat(amount) >= 50 && (
              <Card className="bg-primary/10 border border-primary p-4" data-testid="card-summary">
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70">Amount</span>
                  <span className="font-semibold text-foreground">₦{parseFloat(amount).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70">Discount ({discount}%)</span>
                  <span className="font-semibold text-green-500">-₦{(parseFloat(amount) * discount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-primary/30 pt-2">
                  <span className="font-semibold text-foreground">You Pay</span>
                  <span className="font-bold text-primary">₦{(parseFloat(amount) * (100 - discount) / 100).toFixed(2)}</span>
                </div>
              </Card>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={purchaseMutation.isPending}
              data-testid="button-purchase"
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Buy Airtime"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
