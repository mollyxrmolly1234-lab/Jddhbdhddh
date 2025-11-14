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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Star, TrendingUp } from "lucide-react";
import type { DataPlan, User } from "@shared/schema";

export default function DataPlans() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("MTN");
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

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

  const { data: plans } = useQuery<DataPlan[]>({
    queryKey: ["/api/data/plans"],
    enabled: isAuthenticated,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: { planId: string; phoneNumber: string }) => {
      return await apiRequest("POST", "/api/data/purchase", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      toast({
        title: "Success!",
        description: "Data purchased successfully",
      });
      setShowPurchaseDialog(false);
      setPhoneNumber("");
      setSelectedPlan(null);
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

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    setShowPurchaseDialog(true);
  };

  const handlePurchase = () => {
    if (!selectedPlan) return;
    
    if (phoneNumber.length !== 11) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 11 digits",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate({
      planId: selectedPlan.id,
      phoneNumber,
    });
  };

  const networkPlans = plans?.filter(p => p.network === selectedNetwork) || [];
  const categories = [...new Set(networkPlans.map(p => p.category))];

  const getPlansByCategory = (category: string) => {
    return networkPlans
      .filter(p => p.category === category)
      .sort((a, b) => a.sizeInMB - b.sizeInMB);
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
              Data Plans
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
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

        <Tabs value={selectedNetwork} onValueChange={setSelectedNetwork} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border" data-testid="tabs-network">
            <TabsTrigger value="MTN" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-mtn">MTN</TabsTrigger>
            <TabsTrigger value="Glo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-glo">Glo</TabsTrigger>
            <TabsTrigger value="Airtel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-airtel">Airtel</TabsTrigger>
            <TabsTrigger value="9mobile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-9mobile">9mobile</TabsTrigger>
          </TabsList>

          {["MTN", "Glo", "Airtel", "9mobile"].map((network) => (
            <TabsContent key={network} value={network} className="mt-0">
              <Accordion type="multiple" className="w-full space-y-4">
                {categories.map((category, catIndex) => {
                  const categoryPlans = getPlansByCategory(category);
                  return (
                    <AccordionItem key={category} value={category} className="border-2 border-primary/30 rounded-lg bg-card overflow-hidden" data-testid={`accordion-category-${catIndex}`}>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover-elevate" data-testid={`trigger-category-${catIndex}`}>
                        <div className="flex items-center gap-3">
                          <span className="font-poppins font-semibold text-foreground text-lg">
                            {category}
                          </span>
                          <Badge variant="outline" className="border-primary text-primary">
                            {categoryPlans.length} plans
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {categoryPlans.map((plan, planIndex) => (
                            <Card
                              key={plan.id}
                              className="border border-border bg-card/50 p-4 hover-elevate cursor-pointer"
                              onClick={() => handlePlanSelect(plan)}
                              data-testid={`card-plan-${catIndex}-${planIndex}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-poppins font-bold text-foreground text-xl" data-testid={`text-plan-size-${catIndex}-${planIndex}`}>
                                    {plan.size}
                                  </h4>
                                  <p className="text-sm text-foreground/60">{plan.validity}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {plan.isBestValue === 1 && (
                                    <Badge className="bg-primary text-primary-foreground">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Best Value
                                    </Badge>
                                  )}
                                  {plan.isMostPopular === 1 && (
                                    <Badge className="bg-green-500 text-white">
                                      <Star className="h-3 w-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-poppins text-2xl font-bold text-primary" data-testid={`text-plan-price-${catIndex}-${planIndex}`}>
                                  ₦{parseFloat(plan.price).toLocaleString('en-NG')}
                                </span>
                                {plan.discount > 0 && (
                                  <Badge variant="outline" className="border-green-500 text-green-500">
                                    {plan.discount}% OFF
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="bg-card border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl text-foreground">Purchase Data</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <Card className="bg-primary/10 border border-primary p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70">Plan</span>
                  <span className="font-semibold text-foreground">{selectedPlan.size}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70">Network</span>
                  <span className="font-semibold text-foreground">{selectedPlan.network}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/70">Validity</span>
                  <span className="font-semibold text-foreground">{selectedPlan.validity}</span>
                </div>
                <div className="flex justify-between border-t border-primary/30 pt-2">
                  <span className="font-semibold text-foreground">Price</span>
                  <span className="font-bold text-primary">₦{parseFloat(selectedPlan.price).toLocaleString('en-NG')}</span>
                </div>
              </Card>

              <div>
                <Label htmlFor="dialog-phone" className="text-foreground mb-2">
                  Phone Number
                </Label>
                <Input
                  id="dialog-phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="bg-input border-border text-foreground"
                  data-testid="input-dialog-phone"
                />
              </div>

              <Button
                onClick={handlePurchase}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={purchaseMutation.isPending}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
