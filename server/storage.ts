import { type User, type InsertUser, type ChatSession, type InsertChatSession, type Medicine, type InsertMedicine, type Pharmacy, type InsertPharmacy } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  
  getMedicines(): Promise<Medicine[]>;
  getMedicinesBySymptoms(symptoms: string): Promise<Medicine[]>;
  
  getPharmacies(): Promise<Pharmacy[]>;
  getPharmaciesByCity(city: string): Promise<Pharmacy[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private medicines: Map<string, Medicine>;
  private pharmacies: Map<string, Pharmacy>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.medicines = new Map();
    this.pharmacies = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample medicines
    const sampleMedicines: Medicine[] = [
      {
        id: randomUUID(),
        name: "Paracetamol",
        genericName: "Acetaminophen",
        dosage: "500mg tablets",
        description: "Pain reliever and fever reducer",
        sideEffects: "Rare: liver damage with overdose",
        availableCountries: ["Thailand", "Singapore", "Malaysia", "Indonesia"]
      },
      {
        id: randomUUID(),
        name: "Domperidone",
        genericName: "Domperidone",
        dosage: "10mg tablets",
        description: "Anti-nausea medication",
        sideEffects: "Dry mouth, headache, abdominal cramps",
        availableCountries: ["Thailand", "Singapore", "Malaysia"]
      },
      {
        id: randomUUID(),
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        dosage: "200mg tablets",
        description: "Anti-inflammatory pain reliever",
        sideEffects: "Stomach irritation, dizziness",
        availableCountries: ["Thailand", "Singapore", "Malaysia", "Indonesia", "Philippines"]
      }
    ];

    sampleMedicines.forEach(medicine => {
      this.medicines.set(medicine.id, medicine);
    });

    // Sample pharmacies in Bangkok, Thailand
    const samplePharmacies: Pharmacy[] = [
      {
        id: randomUUID(),
        name: "Boots Pharmacy",
        address: "Central World, 4th Floor, 999/9 Rama I Rd",
        latitude: "13.7470",
        longitude: "100.5392",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-613-1111",
        openingHours: "10:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Watsons",
        address: "Siam Paragon, B1 Floor, 991 Rama I Rd",
        latitude: "13.7460",
        longitude: "100.5352",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-610-8000",
        openingHours: "10:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Fascino Pharmacy",
        address: "Terminal 21, 2nd Floor, 88 Sukhumvit Soi 19",
        latitude: "13.7308",
        longitude: "100.5609",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-108-0888",
        openingHours: "10:00 AM - 10:00 PM"
      }
    ];

    // Add Jakarta pharmacies
    const jakartaPharmacies: Pharmacy[] = [
      {
        id: randomUUID(),
        name: "Alfamart",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-12345678",
        openingHours: "24/7"
      },
      {
        id: randomUUID(),
        name: "Indomaret",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-87654321",
        openingHours: "6:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Guardian",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-11223344",
        openingHours: "8:00 AM - 9:00 PM"
      }
    ];

    // Add Vietnam pharmacy
    const vietnamPharmacies: Pharmacy[] = [
      {
        id: randomUUID(),
        name: "Pharmacity",
        address: "135 Nguyen Hue, District 1, Ho Chi Minh City",
        latitude: "10.7741",
        longitude: "106.7020",
        country: "Vietnam",
        city: "Ho Chi Minh City",
        phoneNumber: "+84-28-3821-5555",
        openingHours: "8:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Guardian Vietnam",
        address: "Vincom Center, 72 Le Thanh Ton, District 1",
        latitude: "10.7783",
        longitude: "106.7019",
        country: "Vietnam",
        city: "Ho Chi Minh City",
        phoneNumber: "+84-28-3936-9999",
        openingHours: "9:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Long Chau Pharmacy",
        address: "230 Pasteur, District 3, Ho Chi Minh City",
        latitude: "10.7850",
        longitude: "106.6872",
        country: "Vietnam",
        city: "Ho Chi Minh City",
        phoneNumber: "+84-1800-6928",
        openingHours: "7:30 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "An Khang Pharmacy",
        address: "45 Pham Ngoc Thach, District 3",
        latitude: "10.7893",
        longitude: "106.6950",
        country: "Vietnam",
        city: "Ho Chi Minh City",
        phoneNumber: "+84-28-3820-8888",
        openingHours: "24/7"
      }
    ];


    const manilaPharmacies: Pharmacy[] = [
      {
        id: randomUUID(),
        name: "Mercury Drug",
        address: "Glorietta 2, Ayala Center, Makati City",
        latitude: "14.5514",
        longitude: "121.0244",
        country: "Philippines",
        city: "Manila",
        phoneNumber: "+63-2-8893-5111",
        openingHours: "7:00 AM - 11:00 PM"
      },
      {
        id: randomUUID(),
        name: "Watsons Philippines",
        address: "SM Mall of Asia, Pasay City",
        latitude: "14.5352",
        longitude: "120.9821",
        country: "Philippines",
        city: "Manila",
        phoneNumber: "+63-2-8556-0900",
        openingHours: "10:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Rose Pharmacy",
        address: "Greenhills Shopping Center, San Juan",
        latitude: "14.6019",
        longitude: "121.0355",
        country: "Philippines",
        city: "Manila",
        phoneNumber: "+63-2-8721-1111",
        openingHours: "9:00 AM - 9:00 PM"
      },
      {
        id: randomUUID(),
        name: "The Generics Pharmacy",
        address: "Robinson's Place Manila, Ermita",
        latitude: "14.5795",
        longitude: "120.9842",
        country: "Philippines",
        city: "Manila",
        phoneNumber: "+63-2-8536-7878",
        openingHours: "8:00 AM - 10:00 PM"
      }
    ];


    // Combine all pharmacies
    const allPharmacies = [...samplePharmacies, ...jakartaPharmacies, ...vietnamPharmacies, ...manilaPharmacies];
    
    allPharmacies.forEach(pharmacy => {
      this.pharmacies.set(pharmacy.id, pharmacy);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async getMedicinesBySymptoms(symptoms: string): Promise<Medicine[]> {
    // Simple keyword matching for demo purposes
    const lowerSymptoms = symptoms.toLowerCase();
    
    return Array.from(this.medicines.values()).filter(medicine => {
      if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('pain')) {
        return medicine.name === 'Paracetamol' || medicine.name === 'Ibuprofen';
      }
      if (lowerSymptoms.includes('nausea') || lowerSymptoms.includes('vomit')) {
        return medicine.name === 'Domperidone';
      }
      if (lowerSymptoms.includes('fever')) {
        return medicine.name === 'Paracetamol' || medicine.name === 'Ibuprofen';
      }
      return false;
    });
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    return Array.from(this.pharmacies.values());
  }

  async getPharmaciesByCity(city: string): Promise<Pharmacy[]> {
    return Array.from(this.pharmacies.values()).filter(pharmacy => 
      pharmacy.city.toLowerCase() === city.toLowerCase()
    );
  }
}

export const storage = new MemStorage();
