import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
// Chat Interface per User Journey
import ChatInterface from "@/components/chat-interface";
import ChatInterface2 from "@/components/chat-interface_2";
import ChatInterface3 from "@/components/chat-interface_3";

// Pharmacy Map per User Journey
import PharmacyMap from "@/components/pharmacy-map";
import PharmacyMap2 from "@/components/pharmacy-map_2";
import PharmacyMap3 from "@/components/pharmacy-map_3";

import myPhoto from "@assets/ai_medical_assisstant_pp.png";
import { Link } from "wouter";
import { useState } from "react";
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
  // State for User Journey #2 integration
  const [journey2Medicines, setJourney2Medicines] = useState<any[]>([]);
  const [journey2Location, setJourney2Location] = useState({ 
    city: 'Ho Chi Minh City', 
    country: 'Vietnam' 
  });

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // [Keep all the existing code before the Demo section unchanged]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - UNCHANGED */}
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
                <Button 
                  size="lg" 
                  className="bg-medical-blue hover:bg-medical-blue/90"
                  onClick={() => handleScrollToSection('demo')}
                  data-testid="button-try-demo"
                >
                  <Play className="mr-2" /> Try Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => handleScrollToSection('how-it-works')}
                  data-testid="button-how-it-works"
                >
                  <MessageCircle className="mr-2" /> How It Works
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-8 text-sm text-medical-gray">
                <div className="flex items-center">
                  <Shield className="mr-2 text-medical-success" size={16} />
                  <span>Medical Grade AI</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 text-medical-success" size={16} />
                  <span>24/7 Available</span>
                </div>
                <div className="flex items-center">
<Globe className="mr-2 text-medical-success" size={16} />
                 <span>Global Coverage</span>
               </div>
             </div>
           </div>
           
           <div className="relative">
             <div className="relative z-10">
               <img
                 src={myPhoto}
                 alt="AI Medical Assistant"
                 className="rounded-2xl shadow-2xl w-full"
               />
             </div>
             <div className="absolute inset-0 bg-medical-blue/20 rounded-2xl transform rotate-3"></div>
           </div>
         </div>
       </div>
     </section>

     {/* Features Section - UNCHANGED */}
     <section className="py-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-features-title">
             Advanced Medical AI at Your Service
           </h2>
           <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-features-description">
             Our platform combines cutting-edge AI with medical knowledge to provide accurate, 
             location-aware health guidance when you need it most.
           </p>
         </div>
         
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-analysis">
             <CardContent className="p-6">
               <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                 <Bot className="text-white text-xl" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Symptom Analysis</h3>
               <p className="text-medical-gray">
                 Advanced AI powered by medical knowledge graphs analyzes your symptoms 
                 and provides evidence-based recommendations tailored to your condition.
               </p>
             </CardContent>
           </Card>
           
           <Card className="bg-medical-light hover:shadow-lg transition-shadow" data-testid="card-feature-location">
             <CardContent className="p-6">
               <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center mb-4">
                 <MapPin className="text-white text-xl" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-3">Location-Aware</h3>
               <p className="text-medical-gray">
                 Automatically detects your location to find medicines available in local 
                 pharmacies, considering regional regulations and availability.
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
                 Find local prescription and alternative medicine options, with clear, safe dosage and usage guidance.
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
                 SEALION excels at Southeast Asian languages and cultural nuances, understanding local medical terms and traditional remedy contexts, 
                 and allowing you to communicate in your preferred language with automatic translation capabilities.
               </p>
             </CardContent>
           </Card>
         </div>
       </div>
     </section>

     {/* How It Works Section - UNCHANGED */}
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
         
         <div className="grid lg:grid-cols-3 gap-8">
           <div className="text-center">
             <div className="w-20 h-20 bg-medical-blue text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" data-testid="step-1-icon">
               1
             </div>
             <h3 className="text-xl font-semibold mb-3" data-testid="step-1-title">Describe Symptoms</h3>
             <p className="text-medical-gray" data-testid="step-1-description">
               Tell our AI assistant about your symptoms in natural language, 
               just like talking to a doctor.
             </p>
           </div>
           
           <div className="text-center">
             <div className="w-20 h-20 bg-medical-blue text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" data-testid="step-2-icon">
               2
             </div>
             <h3 className="text-xl font-semibold mb-3" data-testid="step-2-title">Get AI Analysis</h3>
             <p className="text-medical-gray" data-testid="step-2-description">
               Our medical AI analyzes your symptoms and provides personalized 
               recommendations based on medical knowledge.
             </p>
           </div>
           
           <div className="text-center">
             <div className="w-20 h-20 bg-medical-blue text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" data-testid="step-3-icon">
               3
             </div>
             <h3 className="text-xl font-semibold mb-3" data-testid="step-3-title">Find Local Medicine</h3>
             <p className="text-medical-gray" data-testid="step-3-description">
               Locate recommended medicines at nearby pharmacies with real-time 
               availability and navigation.
             </p>
           </div>
         </div>
       </div>
     </section>

     {/* Demo Section - UPDATED FOR USER JOURNEY #2 */}
     <section id="demo" className="py-20 bg-white">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-12">
           <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-demo-title">
             Try Our Medical Assistant
           </h2>
           <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-demo-description">
             Experience different user journeys and see how our AI adapts to various medical scenarios
           </p>
         </div>

         <Tabs defaultValue="journey1" className="w-full">
           <TabsList className="grid w-full grid-cols-3 mb-8">
             <TabsTrigger value="journey1" className="data-[state=active]:bg-medical-blue data-[state=active]:text-white">
               <MapPin className="mr-2" size={16} />
               User Journey #1
             </TabsTrigger>
             <TabsTrigger value="journey2" className="data-[state=active]:bg-medical-blue data-[state=active]:text-white">
               <MapPin className="mr-2" size={16} />
               User Journey #2
             </TabsTrigger>
             <TabsTrigger value="journey3" className="data-[state=active]:bg-medical-blue data-[state=active]:text-white">
               <MapPin className="mr-2" size={16} />
               User Journey #3
             </TabsTrigger>
           </TabsList>

           <TabsContent value="journey1" className="space-y-8">
             <div className="grid lg:grid-cols-2 gap-8">
               <div>
                 <ChatInterface />
               </div>
               <div className="space-y-4">
                 <PharmacyMap city="Bangkok" country="Thailand" />
               </div>
             </div>
           </TabsContent>

           {/* UPDATED USER JOURNEY #2 WITH INTEGRATION */}
           <TabsContent value="journey2" className="space-y-8">
             <div className="grid lg:grid-cols-2 gap-8">
               <div>
                 <ChatInterface2 
                   onMedicinesUpdate={setJourney2Medicines}
                   onLocationUpdate={setJourney2Location}
                 />
               </div>
               <div className="space-y-4">
                 <PharmacyMap2 
                   city={journey2Location.city} 
                   country={journey2Location.country}
                   medicines={journey2Medicines}
                 />
               </div>
             </div>
           </TabsContent>

           <TabsContent value="journey3" className="space-y-8">
             <div className="grid lg:grid-cols-2 gap-8">
               <div>
                 <ChatInterface3 />
               </div>
               <div className="space-y-4">
                 <PharmacyMap3 city="Manila" country="Philippines" />
               </div>
             </div>
           </TabsContent>
         </Tabs>
       </div>
     </section>

     {/* Footer - UNCHANGED */}
     <footer className="bg-gray-900 text-white py-12">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid md:grid-cols-4 gap-8">
           <div>
             <h3 className="text-lg font-semibold mb-4">Medical Assistant</h3>
             <p className="text-gray-400 text-sm">
               AI-powered health companion for travelers worldwide.
             </p>
           </div>
           
           <div>
             <h4 className="text-sm font-semibold mb-3">Features</h4>
             <ul className="space-y-2 text-sm text-gray-400">
               <li>Symptom Analysis</li>
               <li>Medicine Finder</li>
               <li>Pharmacy Locator</li>
               <li>Multi-language</li>
             </ul>
           </div>
           
           <div>
             <h4 className="text-sm font-semibold mb-3">Support</h4>
             <ul className="space-y-2 text-sm text-gray-400">
               <li>Help Center</li>
               <li>Contact Us</li>
               <li>Privacy Policy</li>
               <li>Terms of Service</li>
             </ul>
           </div>
           
           <div>
             <h4 className="text-sm font-semibold mb-3">Connect</h4>
             <p className="text-gray-400 text-sm mb-4">
               Stay updated with our latest features and medical AI developments.
             </p>
           </div>
         </div>
         
         <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
           <p>© 2024 Medical Assistant. For informational purposes only. Always consult healthcare professionals.</p>
         </div>
       </div>
     </footer>
   </div>
 );
}