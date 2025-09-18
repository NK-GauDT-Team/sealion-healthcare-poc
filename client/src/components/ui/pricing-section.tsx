import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Clock, Smartphone, BarChart3, Code2, Bot } from "lucide-react";

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  priceId: string;
}

const plans: PricingPlan[] = [
  {
    name: "Basic",
    price: 290,
    description: "Ideal for startup or small travel/insurance agencies (Note: pricing shown is for demonstration purposes only)",
    priceId: "price_basic",
    features: [
      "Up to 10,000 customer supported per month",
      "Basic customization",
      "Email support",
      "Basic analytics"
    ]
  },
  {
    name: "Professional",
    price: 790,
    description: "For growing travel or insurance businesses (Note: pricing shown is for demonstration purposes only)",
    priceId: "price_pro",
    popular: true,
    features: [
      "Up to 500,000 customer supported per month",
      "Advanced customization",
      "Priority email & chat support", 
      "Advanced analytics & reporting",
      "API access"
    ]
  },
  {
    name: "Partnership Promotion",
    price: 100,
    description: "Designed for healthcare or pharmacy organizations seeking to advertise their stores and products (Note: pricing is for demonstration only)",
    priceId: "price_enterprise",
    features: [
      "Up to 100 branding medicine products",
      "Customizedable photo product",
      "Dedicated backend support",
      "Custom integrations"
    ]
  }
];

const serviceFeatures = [
  {
    icon: Bot,
    title: "AI Medical Assistant",
    description: "Advanced AI trained on medical knowledge"
  },
  {
    icon: Code2,
    title: "Easy Website Integration",
    description: "Simple embed code for any website"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Always available for your users"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Secure and privacy-focused"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Works perfectly on all devices"
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Track engagement and performance"
  }
];

interface PricingSectionProps {
  onContactSales: () => void;
}

export function PricingSection({ onContactSales }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Personal Medical Assistant Chatbot
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Embed our AI-powered medical assistant directly into your website. Provide your visitors with instant, 
            reliable health information and preliminary medical guidance 24/7.
          </p>
        </div>

        {/* Service Features */}
        <div className="mb-16">
          <Card className="shadow-sm border border-border">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
                What You Get
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 text-primary flex-shrink-0 mt-1">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            We offer two payment options: the <b>Basic and Professional plans</b>, designed for travel or insurance agencies, and a separate partnership plan for pharmacies who wish to promote their products or stores (with prioritized placement, similar to Google Ads).
          </p>
          <div className="flex justify-center items-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm"></span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm"></span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm"></span>
            </div>
          </div>
        </div>
        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`shadow-sm border relative ${
                plan.popular 
                  ? 'border-2 border-primary transform scale-105 shadow-lg' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 px-6 font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                  }`}
                  onClick={() => onContactSales()}
                  data-testid={`button-subscribe-${plan.name.toLowerCase()}`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Learn More'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Trusted by healthcare professionals worldwide</p>
          <div className="flex justify-center items-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
