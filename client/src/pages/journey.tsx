import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  MessageCircle, 
  Brain, 
  Search, 
  MapPin, 
  User, 
  Bot, 
  Pill, 
  Navigation as NavigationIcon,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Journey() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="py-12 bg-medical-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-journey-title">
              Your Medical Assistant Journey
            </h1>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto" data-testid="text-journey-description">
              Follow this step-by-step visual guide to understand how our AI-powered medical assistant helps you get the care you need while traveling.
            </p>
          </div>

          {/* Journey Steps */}
          <div className="space-y-12">
            
            {/* Step 1: User Starts Chat */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <Card>
                  <CardContent className="p-6">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                      alt="Medical chatbot interface" 
                      className="rounded-lg w-full"
                      data-testid="img-journey-step-1"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">1</div>
                  <Badge className="bg-medical-blue text-white" data-testid="badge-step-1">
                    <User className="w-3 h-3 mr-1" />
                    User Input
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-1-title">
                  Start the Conversation
                </h2>
                <p className="text-medical-gray mb-6" data-testid="text-step-1-description">
                  Begin by describing your symptoms in natural language. Our AI understands casual conversation, 
                  so you can explain how you feel just like you would to a friend or doctor.
                </p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700 italic" data-testid="text-example-input">
                    "I have a headache and feel nauseous. I'm currently visiting Bangkok and don't know what medicine to take."
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-medical-gray">
                  <div className="flex items-center" data-testid="feature-natural-language">
                    <CheckCircle className="text-medical-success mr-1" size={16} />
                    Natural language processing
                  </div>
                  <div className="flex items-center" data-testid="feature-multilingual">
                    <CheckCircle className="text-medical-success mr-1" size={16} />
                    Multilingual support
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="mx-auto text-medical-blue" size={24} data-testid="icon-arrow-1" />

            {/* Step 2: AI Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">2</div>
                  <Badge className="bg-purple-500 text-white" data-testid="badge-step-2">
                    <Bot className="w-3 h-3 mr-1" />
                    AI Processing
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-2-title">
                  Intelligent Symptom Analysis
                </h2>
                <p className="text-medical-gray mb-6" data-testid="text-step-2-description">
                  Our advanced AI, powered by medical knowledge bases, analyzes your symptoms and determines 
                  the severity level and potential treatments.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm" data-testid="ai-capability-symptoms">
                    <Brain className="text-medical-blue mr-2" size={16} />
                    <span>Symptom pattern recognition</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="ai-capability-severity">
                    <Brain className="text-medical-blue mr-2" size={16} />
                    <span>Severity assessment (low/medium/high)</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="ai-capability-recommendations">
                    <Brain className="text-medical-blue mr-2" size={16} />
                    <span>Treatment recommendations</span>
                  </div>
                </div>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-analysis-result">AI Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Symptoms Identified:</p>
                        <p className="text-sm text-blue-800">Headache, Nausea</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-900">Severity Level:</p>
                        <Badge className="bg-yellow-500 text-white mt-1">Medium Priority</Badge>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Preliminary Assessment:</p>
                        <p className="text-sm text-green-800">Likely tension headache with associated nausea</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <ArrowRight className="mx-auto text-medical-blue" size={24} data-testid="icon-arrow-2" />

            {/* Step 3: RAG Search */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-medical-light rounded-lg">
                        <span className="text-sm font-medium">Medical Database Search</span>
                        <div className="w-2 h-2 bg-medical-success rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600" data-testid="search-source-1">
                          <Search className="mr-2" size={14} />
                          <span>WHO Essential Medicines List</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600" data-testid="search-source-2">
                          <Search className="mr-2" size={14} />
                          <span>Thailand FDA Database</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600" data-testid="search-source-3">
                          <Search className="mr-2" size={14} />
                          <span>Local Pharmacy Inventory</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">3</div>
                  <Badge className="bg-green-500 text-white" data-testid="badge-step-3">
                    <Search className="w-3 h-3 mr-1" />
                    RAG Search
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-3-title">
                  Medical Knowledge Search
                </h2>
                <p className="text-medical-gray mb-6" data-testid="text-step-3-description">
                  Using Retrieval-Augmented Generation (RAG), our system searches through trusted medical databases, 
                  pharmaceutical guidelines, and local drug availability databases.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm" data-testid="rag-feature-trusted">
                    <CheckCircle className="text-medical-success mr-2" size={16} />
                    <span>Searches trusted medical sources</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="rag-feature-updated">
                    <CheckCircle className="text-medical-success mr-2" size={16} />
                    <span>Real-time database updates</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="rag-feature-local">
                    <CheckCircle className="text-medical-success mr-2" size={16} />
                    <span>Location-specific medicine availability</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="mx-auto text-medical-blue" size={24} data-testid="icon-arrow-3" />

            {/* Step 4: Local Medicine Search */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">4</div>
                  <Badge className="bg-orange-500 text-white" data-testid="badge-step-4">
                    <Pill className="w-3 h-3 mr-1" />
                    Local Search
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-4-title">
                  Find Available Medicines
                </h2>
                <p className="text-medical-gray mb-6" data-testid="text-step-4-description">
                  The system identifies medicines available in your current location, including local alternatives, 
                  generic equivalents, and over-the-counter options that match your needs.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm" data-testid="local-feature-alternatives">
                    <Pill className="text-medical-blue mr-2" size={16} />
                    <span>Local medicine alternatives</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="local-feature-regulations">
                    <Pill className="text-medical-blue mr-2" size={16} />
                    <span>Country-specific regulations</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="local-feature-otc">
                    <Pill className="text-medical-blue mr-2" size={16} />
                    <span>OTC vs prescription classification</span>
                  </div>
                </div>
              </div>
              <div>
                <Card data-testid="card-medicine-results">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Medicines in Bangkok</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3" data-testid="medicine-result-paracetamol">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">Paracetamol (Panadol)</span>
                          <Badge className="bg-medical-success text-white text-xs">Available</Badge>
                        </div>
                        <p className="text-xs text-gray-600">500mg tablets • Max 4 times daily</p>
                        <p className="text-xs text-medical-blue">Found at 15 locations nearby</p>
                      </div>
                      <div className="border rounded-lg p-3" data-testid="medicine-result-domperidone">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">Domperidone</span>
                          <Badge className="bg-medical-warning text-white text-xs">Prescription</Badge>
                        </div>
                        <p className="text-xs text-gray-600">10mg tablets • Consult pharmacist</p>
                        <p className="text-xs text-medical-blue">Available at major pharmacies</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <ArrowRight className="mx-auto text-medical-blue" size={24} data-testid="icon-arrow-4" />

            {/* Step 5: Pharmacy Map */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <Card data-testid="card-pharmacy-map">
                  <CardContent className="p-4">
                    <img 
                      src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                      alt="Pharmacy locations map" 
                      className="rounded-lg w-full h-48 object-cover"
                      data-testid="img-journey-step-5"
                    />
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded" data-testid="pharmacy-list-boots">
                        <span className="text-sm font-medium">Boots Pharmacy</span>
                        <span className="text-xs text-gray-500">0.2 km</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded" data-testid="pharmacy-list-watsons">
                        <span className="text-sm font-medium">Watsons</span>
                        <span className="text-xs text-gray-500">0.5 km</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded" data-testid="pharmacy-list-seven">
                        <span className="text-sm font-medium">7-Eleven</span>
                        <span className="text-xs text-gray-500">0.1 km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">5</div>
                  <Badge className="bg-red-500 text-white" data-testid="badge-step-5">
                    <MapPin className="w-3 h-3 mr-1" />
                    Location Finder
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-5-title">
                  Interactive Pharmacy Map
                </h2>
                <p className="text-medical-gray mb-6" data-testid="text-step-5-description">
                  Get an interactive map showing nearby pharmacies, drug stores, and convenience stores where 
                  you can purchase the recommended medicines. Each location shows distance, operating hours, and contact information.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm" data-testid="map-feature-realtime">
                    <MapPin className="text-medical-blue mr-2" size={16} />
                    <span>Real-time location data</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="map-feature-directions">
                    <NavigationIcon className="text-medical-blue mr-2" size={16} />
                    <span>Turn-by-turn navigation</span>
                  </div>
                  <div className="flex items-center text-sm" data-testid="map-feature-hours">
                    <MapPin className="text-medical-blue mr-2" size={16} />
                    <span>Operating hours & contact info</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="mx-auto text-medical-blue" size={24} data-testid="icon-arrow-5" />

            {/* Step 6: Final Result */}
            <div className="text-center">
              <div className="inline-flex items-center mb-6">
                <div className="w-12 h-12 bg-medical-success rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">6</div>
                <Badge className="bg-medical-success text-white" data-testid="badge-step-6">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mission Complete
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-step-6-title">
                Ready to Get Better!
              </h2>
              <p className="text-medical-gray mb-8 max-w-2xl mx-auto" data-testid="text-step-6-description">
                You now have everything you need: a clear understanding of your condition, specific medicine recommendations, 
                and exact locations where you can purchase them. Your health journey abroad just got much easier!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button className="bg-medical-blue hover:bg-medical-blue-dark text-white px-8 py-3" data-testid="button-try-demo">
                    <MessageCircle className="mr-2" size={20} />
                    Try the Demo Now
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white px-8 py-3" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Benefits Summary */}
          <Card className="mt-16">
            <CardHeader>
              <CardTitle className="text-center text-2xl" data-testid="text-benefits-title">
                Why This Journey Works So Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center" data-testid="benefit-accuracy">
                  <div className="w-12 h-12 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="text-white" size={24} />
                  </div>
                  <h4 className="font-semibold mb-2">AI-Powered Accuracy</h4>
                  <p className="text-sm text-medical-gray">
                    Advanced machine learning ensures accurate symptom analysis and appropriate recommendations
                  </p>
                </div>
                <div className="text-center" data-testid="benefit-local">
                  <div className="w-12 h-12 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <h4 className="font-semibold mb-2">Local Expertise</h4>
                  <p className="text-sm text-medical-gray">
                    Location-aware recommendations that understand local regulations and medicine availability
                  </p>
                </div>
                <div className="text-center" data-testid="benefit-instant">
                  <div className="w-12 h-12 bg-medical-warning rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <h4 className="font-semibold mb-2">Instant Results</h4>
                  <p className="text-sm text-medical-gray">
                    Get comprehensive health guidance in minutes, not hours or days of research
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
