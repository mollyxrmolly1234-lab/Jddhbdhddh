import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Copy, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function FundWallet() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [step, setStep] = useState<"input" | "generating" | "display" | "confirming">("input");
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
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

  const fundMutation = useMutation({
    mutationFn: async (fundAmount: number) => {
      return await apiRequest("POST", "/api/wallet/fund", { amount: fundAmount });
    },
    onSuccess: () => {
      // Show generating animation
      setStep("generating");
      setTimeout(() => {
        setStep("display");
      }, 2000);
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

  const confirmMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wallet/confirm", { amount: parseFloat(amount) });
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
    const fundAmount = parseFloat(amount);
    
    if (isNaN(fundAmount) || fundAmount < 1000) {
      toast({
        title: "Invalid Amount",
        description: "Minimum funding is ₦1,000",
        variant: "destructive",
      });
      return;
    }

    fundMutation.mutate(fundAmount);
  };

  const handleConfirm = () => {
    setStep("confirming");
    confirmMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-poppins text-2xl font-bold text-primary" data-testid="text-page-title">
              Fund Wallet
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        {step === "input" && (
          <Card className="border-2 border-primary/30 bg-card p-8" data-testid="card-fund-input">
            <h2 className="font-poppins text-xl font-semibold text-foreground mb-6">
              Enter Amount
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-foreground mb-2">
                  Amount (₦)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1000"
                  step="100"
                  className="bg-input border-border text-foreground text-lg"
                  data-testid="input-amount"
                />
                <p className="text-sm text-foreground/60 mt-2">
                  Minimum funding is ₦1,000
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={fundMutation.isPending}
                data-testid="button-continue"
              >
                {fundMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Card>
        )}

        {step === "generating" && (
          <Card className="border-2 border-primary/30 bg-card p-12 text-center" data-testid="card-generating">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <h2 className="font-poppins text-2xl font-semibold text-primary mt-8">
                Generating Account...
              </h2>
              <p className="text-foreground/60 mt-2">
                Please wait while we create your payment details
              </p>
            </div>
          </Card>
        )}

        {step === "display" && (
          <Card className="border-2 border-primary bg-card p-8" data-testid="card-payment-details">
            <div className="text-center mb-8">
              <h2 className="font-poppins text-2xl font-semibold text-foreground mb-2">
                Make Payment To
              </h2>
              <p className="text-foreground/60">
                Transfer ₦{parseFloat(amount).toLocaleString('en-NG')} to this account
              </p>
            </div>

            <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 mb-6 space-y-6">
              <div className="text-center">
                <p className="text-foreground/70 text-sm mb-2">Account Number</p>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-poppins text-4xl font-bold text-primary" data-testid="text-account-number">
                    8168877628
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard("8168877628")}
                    className="text-primary"
                    data-testid="button-copy-account"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-foreground/70 text-sm mb-2">Bank</p>
                <h3 className="font-poppins text-2xl font-bold text-foreground" data-testid="text-bank-name">
                  OPAY
                </h3>
              </div>

              <div className="text-center">
                <p className="text-foreground/70 text-sm mb-2">Account Name</p>
                <h3 className="font-poppins text-xl font-semibold text-foreground" data-testid="text-account-name">
                  ABOSEDE AJAYI
                </h3>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/80 text-center">
                After making the payment, click "I've made payment" below to confirm your transaction
              </p>
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-testid="button-confirm-payment"
            >
              I've Made Payment
            </Button>
          </Card>
        )}

        {step === "confirming" && (
          <Card className="border-2 border-primary/30 bg-card p-12 text-center" data-testid="card-confirming">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <h2 className="font-poppins text-2xl font-semibold text-primary mt-8">
                Confirming Payment...
              </h2>
              <p className="text-foreground/60 mt-2">
                Please wait while we verify your payment
              </p>
              <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground/70">
                  This may take a few moments
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
