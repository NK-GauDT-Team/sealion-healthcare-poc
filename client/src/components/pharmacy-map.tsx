import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  country: string;
  city: string;
  phoneNumber?: string;
  openingHours?: string;
}

interface PharmacyMapProps {
  country?: string;
  city?: string;
  className?: string;
}

export default function PharmacyMap({ country = "Thailand", city = "Bangkok", className = "" }: PharmacyMapProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['/api/pharmacies', { country, city }],
    queryFn: async () => {
      const response = await fetch(`/api/pharmacies?country=${country}&city=${city}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pharmacies');
      }
      return response.json();
    }
  });

  const calculateDistance = (lat1: string, lon1: string, lat2: string, lon2: string) => {
    // Simple distance calculation (Haversine formula approximation)
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
    const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Simulate user location (Bangkok city center)
  const userLat = "13.7563";
  const userLon = "100.5018";

  const pharmaciesWithDistance = pharmacies?.map((pharmacy: Pharmacy) => ({
    ...pharmacy,
    distance: calculateDistance(userLat, userLon, pharmacy.latitude, pharmacy.longitude)
  })).sort((a: any, b: any) => a.distance - b.distance) || [];

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Medicine Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg" data-testid="text-medicine-recommendations">
            <MapPin className="text-medical-blue mr-2" size={20} />
            Recommended Medicines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3" data-testid="medicine-card-paracetamol">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Paracetamol</span>
                <Badge className="bg-medical-success text-white" data-testid="badge-available">Available</Badge>
              </div>
              <p className="text-xs text-medical-gray">500mg tablets • Max 4 times daily</p>
              <p className="text-xs text-medical-blue mt-1">Found at {pharmaciesWithDistance.length} nearby locations</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3" data-testid="medicine-card-domperidone">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Domperidone</span>
                <Badge className="bg-medical-warning text-white" data-testid="badge-prescription">Prescription</Badge>
              </div>
              <p className="text-xs text-medical-gray">10mg tablets • Consult pharmacist</p>
              <p className="text-xs text-medical-blue mt-1">Available at pharmacies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg" data-testid="text-nearby-pharmacies">
            <MapPin className="text-medical-blue mr-2" size={20} />
            Nearby Pharmacies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Map container with pharmacy locations */}
          <div className="h-64 relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
            {/* Map background - using CSS to simulate map */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                {/* Street lines simulation */}
                <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gray-300 transform -rotate-12"></div>
                <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gray-300 transform rotate-12"></div>
                <div className="absolute left-1/3 top-0 w-0.5 h-full bg-gray-300 transform rotate-12"></div>
                <div className="absolute left-2/3 top-0 w-0.5 h-full bg-gray-300 transform -rotate-12"></div>
              </div>
            </div>

            {/* User location marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg pulse-animation"></div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-white px-2 py-1 rounded shadow-md whitespace-nowrap">
                Your Location
              </div>
            </div>

            {/* Pharmacy markers */}
            {pharmaciesWithDistance.slice(0, 3).map((pharmacy: any, index: number) => {
              const positions = [
                { top: '30%', left: '60%' }, // Boots Pharmacy
                { top: '65%', left: '35%' }, // Watsons
                { top: '40%', left: '75%' }, // Fascino Pharmacy
              ];
              
              return (
                <div
                  key={pharmacy.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 ${
                    selectedPharmacy?.id === pharmacy.id ? 'scale-110' : ''
                  }`}
                  style={positions[index]}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                  data-testid={`pharmacy-marker-${index}`}
                >
                  <div className="w-6 h-6 bg-medical-blue rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <MapPin size={12} className="text-white" />
                  </div>
                  {selectedPharmacy?.id === pharmacy.id && (
                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border min-w-48 z-30">
                      <h4 className="font-semibold text-sm">{pharmacy.name}</h4>
                      <p className="text-xs text-gray-600">{pharmacy.address}</p>
                      <p className="text-xs text-medical-blue">{pharmacy.distance.toFixed(1)} km away</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" className="text-xs px-2 py-1" data-testid={`button-directions-${index}`}>
                          Directions
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1" data-testid={`button-call-${index}`}>
                          Call
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
              <div className="space-y-1" data-testid="map-legend">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-medical-blue rounded-full"></div>
                  <span>Pharmacy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy list */}
          <div className="p-4 border-t">
            <div className="space-y-3">
              {pharmaciesWithDistance.slice(0, 3).map((pharmacy: any, index: number) => (
                <div
                  key={pharmacy.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPharmacy?.id === pharmacy.id ? 'border-medical-blue bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                  data-testid={`pharmacy-list-item-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{pharmacy.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{pharmacy.address}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {pharmacy.phoneNumber && (
                          <div className="flex items-center space-x-1">
                            <Phone size={10} />
                            <span>{pharmacy.phoneNumber}</span>
                          </div>
                        )}
                        {pharmacy.openingHours && (
                          <div className="flex items-center space-x-1">
                            <Clock size={10} />
                            <span>{pharmacy.openingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {pharmacy.distance.toFixed(1)} km
                      </Badge>
                      <div className="mt-2 flex space-x-1">
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1" data-testid={`button-directions-list-${index}`}>
                          <Navigation size={10} />
                        </Button>
                        {pharmacy.phoneNumber && (
                          <Button size="sm" variant="outline" className="text-xs px-2 py-1" data-testid={`button-call-list-${index}`}>
                            <Phone size={10} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
}
