import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Info, ArrowRight } from "lucide-react";

export function ContactSection() {

  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our Personal Medical Assistant Chatbot? We're here to help you get started.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information Card */}
          <Card className="shadow-sm border border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Email</h3>
                </div>
              </div>
              <p className="text-foreground font-medium mb-1" data-testid="text-contact-email">bizdev@indokoei.co.id</p>
              <p className="text-sm text-muted-foreground">We respond ASAP</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Phone</h3>
                </div>
              </div>
              <p className="text-foreground font-medium mb-1" data-testid="text-contact-phone">+628-581922-0728</p>
              <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Address</h3>
                </div>
              </div>
              <p className="text-foreground font-medium" data-testid="text-contact-address">
                10 Bayfront Ave, Singapore 018956
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Hours - Full Width */}
        {/* <div className="mt-12 max-w-4xl mx-auto">
          <Card className="shadow-sm border border-border">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Business Hours</h3>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Weekdays</h4>
                  <p className="text-muted-foreground">Monday - Friday</p>
                  <p className="text-foreground font-medium">9:00 AM - 6:00 PM EST</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Weekend</h4>
                  <p className="text-muted-foreground">Saturday</p>
                  <p className="text-foreground font-medium">10:00 AM - 4:00 PM EST</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Sunday</h4>
                  <p className="text-muted-foreground">Closed</p>
                  <p className="text-foreground font-medium">-</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 rounded-lg text-center">
                <p className="text-sm text-foreground">
                  <Info className="inline w-4 h-4 mr-2" />
                  Emergency technical support available 24/7 for Enterprise customers
                </p>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </section>
  );
}
