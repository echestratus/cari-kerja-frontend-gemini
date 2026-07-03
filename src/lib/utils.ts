import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  Code, Palette, Megaphone, Calculator, HeartPulse, 
  GraduationCap, HardHat, Headphones, Users, Briefcase,
  Building, Scale, Factory, Store, Truck, Utensils, FlaskConical,
  Microscope, LineChart, Shield, Leaf, MonitorSmartphone, Plane, Coffee
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryIcon(name: string) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("tech") || lowerName.includes("data") || lowerName.includes(" it ")) return MonitorSmartphone;
  if (lowerName.includes("business") || lowerName.includes("finance") || lowerName.includes("management")) return Calculator;
  if (lowerName.includes("creative") || lowerName.includes("media")) return Palette;
  if (lowerName.includes("customer") || lowerName.includes("admin")) return Headphones;
  if (lowerName.includes("health") || lowerName.includes("wellness")) return HeartPulse;
  if (lowerName.includes("education") || lowerName.includes("science")) return GraduationCap;
  if (lowerName.includes("legal") || lowerName.includes("government")) return Scale;
  if (lowerName.includes("engineer") || lowerName.includes("manufactur")) return HardHat;
  if (lowerName.includes("logistic") || lowerName.includes("transport") || lowerName.includes("retail")) return Truck;
  if (lowerName.includes("hospitality") || lowerName.includes("tourism") || lowerName.includes("service")) return Coffee;
  if (lowerName.includes("agricultur") || lowerName.includes("energy") || lowerName.includes("environment")) return Leaf;
  
  return Briefcase;
}
