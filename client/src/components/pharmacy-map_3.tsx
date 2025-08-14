import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
 

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
const SCRIPTED_LOCATION = 'Manila'
// Hardcoded scripted medicine changes
const SCRIPTED_MEDICINES = [
  {
    step: 1,
    medicines: [
      {
        name: "Strepsils Lozenges",
        dosage: "1 lozenge • Every 2-3 hours",
        availability: "Available",
        description: "Antiseptic throat lozenges for infection control"
      },
      {
        name: "Lagundi Syrup",
        dosage: "5-10ml • 3 times daily",
        availability: "Available",
        description: "DOH-approved herbal cough and throat remedy"
      }
    ]
  },
  {
    step: 2,
    medicines: [
      {
        name: "Amoxicillin 500mg",
        dosage: "1 capsule • Every 8 hours",
        availability: "Available",
        description: "Antibiotic for bacterial throat infections"
      },
      {
        name: "Sambong Tea",
        dosage: "1 tea bag • 3-4 times daily",
        availability: "Available",
        description: "Traditional antipyretic and anti-inflammatory tea"
      }
    ]
  },
  {
    step: 3,
    medicines: [
      {
        name: "Azithromycin 500mg",
        dosage: "500mg • Once daily for 3 days",
        availability: "Available",
        description: "Macrolide antibiotic for severe tonsillitis"
      },
      {
        name: "Tawa-tawa Extract",
        dosage: "5ml • Twice daily",
        availability: "Available",
        description: "Immune-boosting traditional Filipino medicine"
      }
    ]
  }
];

export default function PharmacyMap({ country = "Thailand", city = SCRIPTED_LOCATION, className = "" }: PharmacyMapProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [medicineStep, setMedicineStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle keydown events to trigger medicine changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (medicineStep < SCRIPTED_MEDICINES.length && !isTransitioning) {
        setIsTransitioning(true);
        
        setTimeout(() => {
          setMedicineStep(prev => prev + 1);
          setIsTransitioning(false);
        }, 4000); // Brief transition animation
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [medicineStep, isTransitioning]);

  // const { data: pharmacies, isLoading } = useQuery({
  //   queryKey: ['/api/pharmacies', { country, city }],
  //   queryFn: async () => {
  //     const response = await fetch(`/api/pharmacies?city=${SCRIPTED_LOCATION}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch pharmacies');
  //     }
  //     return response.json();
  //   },
  //   enabled: medicineStep > 0 // Only fetch when a key has been pressed
  // });

  // Local pharmacies (no API calls)
  const LOCAL_PHARMACIES: Pharmacy[] = [
    {
      id: 'pharmacy-mercury-drug',
      name: 'Mercury Drug',
      address: 'Glorietta 2, Ayala Center, Makati City',
      latitude: '14.5514',
      longitude: '121.0244',
      country: 'Philippines',
      city: 'Manila',
      phoneNumber: '+63-2-8893-5111',
      openingHours: '7:00 AM - 11:00 PM'
    },
    {
      id: 'pharmacy-watsons-ph',
      name: 'Watsons Philippines',
      address: 'SM Mall of Asia, Pasay City',
      latitude: '14.5352',
      longitude: '120.9821',
      country: 'Philippines',
      city: 'Manila',
      phoneNumber: '+63-2-8556-0900',
      openingHours: '10:00 AM - 10:00 PM'
    },
    {
      id: 'pharmacy-rose',
      name: 'Rose Pharmacy',
      address: 'Greenhills Shopping Center, San Juan',
      latitude: '14.6019',
      longitude: '121.0355',
      country: 'Philippines',
      city: 'Manila',
      phoneNumber: '+63-2-8721-1111',
      openingHours: '9:00 AM - 9:00 PM'
    },
    {
      id: 'pharmacy-generics',
      name: 'The Generics Pharmacy',
      address: "Robinson's Place Manila, Ermita",
      latitude: '14.5795',
      longitude: '120.9842',
      country: 'Philippines',
      city: 'Manila',
      phoneNumber: '+63-2-8536-7878',
      openingHours: '8:00 AM - 10:00 PM'
    }
  ];

  const pharmacies: Pharmacy[] = LOCAL_PHARMACIES;
  const isLoading = false;

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
  const userLat = "14.5995";
  const userLon = "120.9842";

  const pharmaciesWithDistance = (pharmacies && medicineStep > 0) 
    ? pharmacies.map((pharmacy: Pharmacy) => ({
        ...pharmacy,
        distance: calculateDistance(userLat, userLon, pharmacy.latitude, pharmacy.longitude)
      })).sort((a: any, b: any) => a.distance - b.distance)
    : [];

  // Get current medicines to display
  const currentMedicines = medicineStep > 0 && medicineStep <= SCRIPTED_MEDICINES.length 
    ? SCRIPTED_MEDICINES[medicineStep - 1].medicines 
    : [];

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
          <CardTitle className="flex items-center justify-between text-lg" data-testid="text-medicine-recommendations">
            <div className="flex items-center">
              <MapPin className="text-medical-blue mr-2" size={20} />
              Recommended Medicines
            </div>
            {/* {medicineStep > 0 && (
              <Badge variant="outline" className="text-xs">
                Step {medicineStep}/3
              </Badge>
            )} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-3 transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {currentMedicines.map((medicine, index) => (
              <div key={`${medicineStep}-${index}`} className="border border-gray-200 rounded-lg p-3" data-testid={`medicine-card-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{medicine.name}</span>
                  <Badge 
                    className={`text-white ${
                      medicine.availability === 'Available' 
                        ? 'bg-medical-success' 
                        : medicine.availability === 'Prescription' 
                          ? 'bg-medical-warning' 
                          : 'bg-medical-blue'
                    }`} 
                    data-testid={`badge-${medicine.availability.toLowerCase()}`}
                  >
                    {medicine.availability}
                  </Badge>
                </div>
                <p className="text-xs text-medical-gray">{medicine.dosage}</p>
                <p className="text-xs text-medical-gray">{medicine.description}</p>
                {/* <p className="text-xs text-medical-blue mt-1">
                  {medicineStep > 0 
                    ? `Found at ${pharmaciesWithDistance.length} nearby locations`
                    : 'Press any key to find nearby locations'
                  }
                </p> */}
              </div>
            ))}
          </div>

          {/* Instruction for initial state */}
          {medicineStep === 0 && (
            <div className="mt-4 text-center">
              {/* <p className="text-xs text-medical-gray bg-blue-50 p-3 rounded-lg border border-blue-200">
                Press any key to start finding medicines and nearby pharmacies
              </p> */}
            </div>
          )}

          {/* Instruction for scripted demo */}
          {/* {medicineStep < SCRIPTED_MEDICINES.length && medicineStep > 0 && !isTransitioning && (
            <div className="mt-4 text-center">
              <p className="text-xs text-medical-gray bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                Press any key to see next medicine recommendations ({medicineStep + 1}/{SCRIPTED_MEDICINES.length})
              </p>
            </div>
          )} */}

          {medicineStep >= SCRIPTED_MEDICINES.length && (
            <div className="mt-4 text-center">
              <p className="text-xs text-medical-gray bg-green-50 p-2 rounded-lg border border-green-200">
                All medicine recommendations completed!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map - Only show when medicines are active */}
      {medicineStep > 0 && (
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
      )}

      <style>{`
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