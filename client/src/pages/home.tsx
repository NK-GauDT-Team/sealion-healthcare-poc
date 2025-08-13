import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import ChatInterface from "@/components/chat-interface";
import PharmacyMap from "@/components/pharmacy-map";
import { Link } from "wouter";
import { 
  MessageCircle, 
  Play, 
  Shield, 
  Clock, 
  Globe, 
  Bot, 
  MapPin, 
  Pill, 
  Languages,
  Star,
  Lock,
  UserCheck,
  AlertTriangle,
  Stethoscope
} from "lucide-react";

export default function Home() {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="text-hero-title">
                Your Health Companion, 
                <span className="text-medical-blue"> Anywhere in the World</span>
              </h1>
              <p className="text-xl text-medical-gray mb-8 leading-relaxed" data-testid="text-hero-description">
                AI-powered medical assistance for travelers. Get instant symptom analysis, 
                local medicine recommendations, and nearby pharmacy locations wherever you are.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/demo">
                  <Button 
                    className="bg-medical-blue hover:bg-medical-blue-dark text-white px-8 py-4 text-base font-semibold"
                    data-testid="button-start-chat"
                  >
                    <MessageCircle className="mr-3" size={20} />
                    Start Medical Chat
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white px-8 py-4 text-base font-semibold"
                  onClick={() => handleScrollToSection('demo')}
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-3" size={20} />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-medical-gray flex-wrap gap-4">
                <div className="flex items-center" data-testid="feature-hipaa">
                  <Shield className="text-medical-success mr-2" size={16} />
                  HIPAA Compliant
                </div>
                <div className="flex items-center" data-testid="feature-24-7">
                  <Clock className="text-medical-success mr-2" size={16} />
                  24/7 Available
                </div>
                <div className="flex items-center" data-testid="feature-countries">
                  <Globe className="text-medical-success mr-2" size={16} />
                  190+ Countries
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Medical consultation online" 
                className="rounded-2xl shadow-2xl w-full"
                data-testid="img-hero-consultation"
              />
              <Card className="absolute -bottom-6 -left-6 max-w-xs">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-medical-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium" data-testid="text-ai-active">AI Assistant Active</span>
                  </div>
                  <p className="text-xs text-medical-gray mt-1" data-testid="text-location-status">
                    Analyzing symptoms in Bangkok, Thailand
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-features-title">
              Everything You Need for Healthy Travel
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-features-description">
              Advanced AI technology combined with local medical knowledge to keep you safe and healthy abroad.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-ai">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                  <Bot className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Symptom Analysis</h3>
                <p className="text-medical-gray">
                  Advanced AI understands your symptoms through natural conversation and provides preliminary assessments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-location">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Location-Aware Care</h3>
                <p className="text-medical-gray">
                  Automatically finds medicines and healthcare options available in your current location.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-medicine">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                  <Pill className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Medicine Finder</h3>
                <p className="text-medical-gray">
                  Discover local alternatives to your regular medications with dosage and safety information.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-language">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                  <Languages className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multilingual Support</h3>
                <p className="text-medical-gray">
                  Communicate in your preferred language with automatic translation capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-medical-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-how-it-works-description">
              Get the medical help you need in just a few simple steps, anywhere in the world.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Traveler health assistance" 
                className="rounded-xl shadow-lg w-full"
                data-testid="img-traveler-assistance"
              />
            </div>
            <div className="space-y-8">
              <div className="flex items-start space-x-4" data-testid="step-describe-symptoms">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Describe Your Symptoms</h3>
                  <p className="text-medical-gray">
                    Start a conversation with our AI assistant. Describe how you're feeling in natural language.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="step-ai-analysis">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis & Recommendations</h3>
                  <p className="text-medical-gray">
                    Our AI analyzes your symptoms using trusted medical sources and provides preliminary recommendations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="step-medicine-search">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Medicine Search</h3>
                  <p className="text-medical-gray">
                    Find available medicines in your current location, including local alternatives and over-the-counter options.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4" data-testid="step-pharmacy-finder">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Nearby Pharmacies</h3>
                  <p className="text-medical-gray">
                    Get an interactive map with nearby pharmacies and stores where you can purchase the recommended medicines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-demo-title">
              Try Our Medical Assistant
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-demo-description">
              Experience how our AI-powered assistant works. This is a demonstration using real medical data.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div>
              <PharmacyMap />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-medical-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-trust-title">
              Built for Trust & Safety
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-trust-description">
              Your health data is protected with enterprise-grade security and privacy standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="trust-feature-hipaa">
              <div className="w-16 h-16 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">HIPAA Compliant</h3>
              <p className="text-medical-gray">
                Full compliance with healthcare privacy regulations to protect your medical information.
              </p>
            </div>
            
            <div className="text-center" data-testid="trust-feature-encryption">
              <div className="w-16 h-16 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
              <p className="text-medical-gray">
                All conversations and medical data are encrypted and never stored permanently.
              </p>
            </div>
            
            <div className="text-center" data-testid="trust-feature-supervision">
              <div className="w-16 h-16 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Medical Supervision</h3>
              <p className="text-medical-gray">
                AI recommendations are based on trusted medical sources and supervised by healthcare professionals.
              </p>
            </div>
          </div>

          <Card className="mt-12 border border-gray-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-medical-warning rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-medical-disclaimer-title">
                    Important Medical Disclaimer
                  </h3>
                  <p className="text-medical-gray text-sm leading-relaxed" data-testid="text-medical-disclaimer">
                    This service provides general health information and should not replace professional medical advice, diagnosis, or treatment. 
                    Always consult with qualified healthcare professionals for serious medical conditions. In case of medical emergencies, 
                    contact local emergency services immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Stethoscope className="text-medical-blue text-2xl mr-3" />
                <span className="text-xl font-semibold" data-testid="text-footer-brand">Personal Medical Assistant</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md" data-testid="text-footer-description">
                AI-powered medical assistance for travelers worldwide. Get instant health support, 
                medicine recommendations, and local pharmacy locations wherever you are.
              </p>
              <Link href="/demo">
                <Button className="bg-medical-blue hover:bg-medical-blue-dark" data-testid="button-footer-trial">
                  Start Free Trial
                </Button>
              </Link>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors" data-testid="link-footer-how-it-works">How It Works</a></li>
                <li><Link href="/demo" className="hover:text-white transition-colors" data-testid="link-footer-demo">Demo</Link></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-api">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-help">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-disclaimer">Medical Disclaimer</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-privacy">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm" data-testid="text-copyright">
              © 2024 Personal Medical Assistant. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="text-medical-success" size={16} />
                <span data-testid="text-footer-hipaa">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Lock className="text-medical-success" size={16} />
                <span data-testid="text-footer-ssl">SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
