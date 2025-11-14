import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Wifi, Wallet, Headphones, Zap, Shield } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Get your airtime and data instantly after purchase"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and encrypted wallet funding system"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "AI-powered customer support always available"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-primary/20" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="font-poppins text-5xl font-bold tracking-tight text-primary sm:text-7xl" data-testid="text-hero-title">
              XTRADATA
            </h1>
            <p className="mt-6 font-poppins text-3xl font-semibold text-foreground sm:text-4xl" data-testid="text-hero-subtitle">
              Nigeria's Cheapest Airtime & Data
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80" data-testid="text-hero-description">
              Buy airtime and data bundles at unbeatable rates. Instant delivery, secure wallet, and 24/7 AI customer support.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Button
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                className="border-primary text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6"
                data-testid="button-login"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-primary/30 bg-card p-8 hover-elevate transition-all duration-300"
              data-testid={`card-feature-${index}`}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-2" data-testid={`text-feature-title-${index}`}>
                {feature.title}
              </h3>
              <p className="text-foreground/70" data-testid={`text-feature-description-${index}`}>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-card/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center font-poppins text-3xl font-bold text-primary mb-12" data-testid="text-services-title">
            Our Services
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-primary/30 bg-card p-8 text-center hover-elevate" data-testid="card-service-airtime">
              <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-2">Cheap Airtime</h3>
              <p className="text-foreground/70">Buy airtime for all Nigerian networks at discounted rates</p>
            </Card>
            <Card className="border-2 border-primary/30 bg-card p-8 text-center hover-elevate" data-testid="card-service-data">
              <Wifi className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-2">Data Bundles</h3>
              <p className="text-foreground/70">SME, Direct, Gifting data plans at very cheap rates</p>
            </Card>
            <Card className="border-2 border-primary/30 bg-card p-8 text-center hover-elevate" data-testid="card-service-wallet">
              <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-2">Easy Wallet</h3>
              <p className="text-foreground/70">Quick wallet funding via OPAY with instant confirmation</p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="mx-auto max-w-3xl text-center px-6">
          <h2 className="font-poppins text-3xl font-bold text-primary mb-6" data-testid="text-cta-title">
            Ready to Start Saving?
          </h2>
          <p className="text-lg text-foreground/80 mb-8" data-testid="text-cta-description">
            Join thousands of Nigerians enjoying the cheapest airtime and data rates
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-12 py-6"
            data-testid="button-cta-signup"
          >
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
}
