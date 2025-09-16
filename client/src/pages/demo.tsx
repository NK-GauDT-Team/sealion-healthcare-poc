import Navigation from "@/components/navigation";
import ChatInterface from "@/components/chat-interface";
import PharmacyMap from "@/components/pharmacy-map";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, Pill, Activity } from "lucide-react";

export default function Demo() {
  const [demoMedicines, setDemoMedicines] = useState<any[]>([]);
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="py-8 bg-medical-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-demo-page-title">
              Live Medical Assistant Demo
            </h1>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-demo-page-description">
              Experience our AI-powered medical assistant in action. Describe your symptoms and get instant recommendations with local pharmacy locations.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
              <Badge className="bg-medical-success text-white" data-testid="badge-demo-live">
                <Activity className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              <Badge variant="outline" data-testid="badge-demo-location">
                <MapPin className="w-3 h-3 mr-1" />
                Bangkok, Thailand
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="text-chat-interface-title">
                    <MessageCircle className="text-medical-blue mr-2" />
                    Medical Consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ChatInterface onMedicinesUpdate={setDemoMedicines} />
                </CardContent>
              </Card>
            </div>

            {/* Pharmacy Map and Medicine Info */}
            <div>
              <PharmacyMap country="Thailand" city="Bangkok" medicines={demoMedicines} />
            </div>
          </div>

          {/* Usage Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-instructions-title">
                <Pill className="text-medical-blue mr-2" />
                How to Use This Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="text-center" data-testid="instruction-step-1">
                  <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-3">1</div>
                  <h4 className="font-semibold mb-2">Describe Symptoms</h4>
                  <p className="text-medical-gray">
                    Type your symptoms in the chat. Try examples like "I have a headache and feel nauseous" or "I have a fever and sore throat"
                  </p>
                </div>
                <div className="text-center" data-testid="instruction-step-2">
                  <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-3">2</div>
                  <h4 className="font-semibold mb-2">Get AI Analysis</h4>
                  <p className="text-medical-gray">
                    Our AI will analyze your symptoms and provide medicine recommendations based on availability in Thailand
                  </p>
                </div>
                <div className="text-center" data-testid="instruction-step-3">
                  <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-3">3</div>
                  <h4 className="font-semibold mb-2">Find Pharmacies</h4>
                  <p className="text-medical-gray">
                    View nearby pharmacy locations on the map and get directions to purchase the recommended medicines
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800" data-testid="text-demo-disclaimer">
                  <strong>Demo Notice:</strong> This is a demonstration using real AI analysis and sample pharmacy data from Bangkok, Thailand. 
                  For actual medical emergencies, please contact local emergency services immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
