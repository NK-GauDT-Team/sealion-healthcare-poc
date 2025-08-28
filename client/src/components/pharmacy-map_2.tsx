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

interface MedicineDisplay {
  name: string;
  dosage: string;
  availability: string;
  description: string;
}

interface PharmacyMapProps {
  country?: string;
  city?: string;
  className?: string;
  medicines?: Array<{
    name: string;
    dosage?: string;
    description: string;
    localAvailability?: string;
  }>;
}

// Default location if none provided
const DEFAULT_LOCATION = 'Ho Chi Minh City';

export default function PharmacyMap({ 
  country = "Vietnam", 
  city = DEFAULT_LOCATION, 
  className = "",
  medicines = []
}: PharmacyMapProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [displayMedicines, setDisplayMedicines] = useState<MedicineDisplay[]>([]);
  
  // Convert medicines from chat format to display format
  useEffect(() => {
    if (medicines && medicines.length > 0) {
      const formattedMedicines = medicines.map(med => ({
        name: med.name,
        dosage: med.dosage || 'As directed',
        availability: med.localAvailability || 'Check availability',
        description: med.description
      }));
      setDisplayMedicines(formattedMedicines);
    }
  }, [medicines]);

  // Fetch pharmacies when location changes
  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pharmacies?city=${encodeURIComponent(city)}`);
        if (response.ok) {
          const data = await response.json();
          setPharmacies(data);
        } else {
          // Use default pharmacies if API fails
          setPharmacies(getDefaultPharmacies(city));
        }
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        // Use default pharmacies on error
        setPharmacies(getDefaultPharmacies(city));
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [city]);

  // Default pharmacies for major cities
  const getDefaultPharmacies = (cityName: string): Pharmacy[] => {
    const defaultData: Record<string, Pharmacy[]> = {
      'Ho Chi Minh City': [
        {
          id: '1',
          name: 'Pharmacity HCMC',
          address: '123 Nguyen Hue, District 1',
          latitude: '10.7769',
          longitude: '106.7009',
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          phoneNumber: '+84 28 3822 0000',
          openingHours: '8:00 AM - 10:00 PM'
        },
        {
          id: '2',
          name: 'Guardian Vietnam',
          address: '456 Le Loi, District 1',
          latitude: '10.7720',
          longitude: '106.6980',
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          phoneNumber: '+84 28 3823 1111',
          openingHours: '9:00 AM - 9:00 PM'
        },
        {
          id: '3',
          name: 'Long Chau Pharmacy',
          address: '789 Tran Hung Dao, District 5',
          latitude: '10.7550',
          longitude: '106.6750',
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          phoneNumber: '+84 28 3835 2222',
          openingHours: '7:30 AM - 10:30 PM'
        }
      ],
      'Manila': [
        {
          id: '1',
          name: 'Mercury Drug Makati',
          address: 'Ayala Avenue, Makati City',
          latitude: '14.5565',
          longitude: '121.0244',
          country: 'Philippines',
          city: 'Manila',
          phoneNumber: '+63 2 8893 0000',
          openingHours: '24 Hours'
        },
        {
          id: '2',
          name: 'Watsons BGC',
          address: 'Bonifacio High Street, Taguig',
          latitude: '14.5507',
          longitude: '121.0509',
          country: 'Philippines',
          city: 'Manila',
          phoneNumber: '+63 2 8847 1111',
          openingHours: '9:00 AM - 10:00 PM'
        },
        {
          id: '3',
          name: 'Rose Pharmacy',
          address: 'Ermita, Manila',
          latitude: '14.5826',
          longitude: '120.9845',
          country: 'Philippines',
          city: 'Manila',
          phoneNumber: '+63 2 8524 2222',
          openingHours: '8:00 AM - 9:00 PM'
        }
      ]
    };

    return defaultData[cityName] || defaultData['Ho Chi Minh City'];
  };

  const handleNavigation = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recommended Medicines Panel */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="mr-2" size={20} />
              Recommended Medicines
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {city}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {displayMedicines.length > 0 ? (
            <div className="space-y-3">
              {displayMedicines.map((medicine, idx) => (
                <div key={idx} className="bg-medical-light p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{medicine.name}</h4>
                    <Badge 
                      variant="default"
                      className="text-xs bg-green-100 text-green-800"
                    >
                      {medicine.availability}
                    </Badge>
                  </div>
                  <p className="text-xs text-medical-gray mb-1">{medicine.description}</p>
                  <p className="text-xs font-medium text-medical-blue">{medicine.dosage}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-medical-gray">
              <p className="text-sm">No medicines recommended yet.</p>
              <p className="text-xs mt-2">Describe your symptoms to get recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Pharmacies */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2" size={20} />
            Nearby Pharmacies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto"></div>
              <p className="text-sm text-medical-gray mt-4">Loading pharmacies...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedPharmacy === pharmacy.id 
                      ? 'border-medical-blue bg-medical-light' 
                      : 'border-gray-200 hover:border-medical-blue/50'
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{pharmacy.name}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation(pharmacy);
                      }}
                    >
                      <Navigation size={14} className="mr-1" />
                      <span className="text-xs">Navigate</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-1 text-xs text-medical-gray">
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-2 flex-shrink-0" />
                      {pharmacy.address}
                    </div>
                    
                    {pharmacy.phoneNumber && (
                      <div className="flex items-center">
                        <Phone size={12} className="mr-2 flex-shrink-0" />
                        {pharmacy.phoneNumber}
                      </div>
                    )}
                    
                    {pharmacy.openingHours && (
                      <div className="flex items-center">
                        <Clock size={12} className="mr-2 flex-shrink-0" />
                        {pharmacy.openingHours}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Interactive Map Placeholder */}
          <div className="mt-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto text-medical-blue mb-2" size={32} />
              <p className="text-sm text-medical-gray">Interactive map view</p>
              <p className="text-xs text-gray-500 mt-1">Click a pharmacy to see on map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}