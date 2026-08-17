import type { LucideIcon } from "lucide-react";
import {
  Pill,
  HeartPulse,
  Syringe,
  Baby,
  Stethoscope,
  ShieldPlus,
} from "lucide-react";

export interface Category {
  id: number;
  name: string;
  icon: typeof Pill;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Pain Relief",
    icon: Pill,
  },
  {
    id: 2,
    name: "Heart Care",
    icon: HeartPulse,
  },
  {
    id: 3,
    name: "Diabetes",
    icon: Syringe,
  },
  {
    id: 4,
    name: "Baby Care",
    icon: Baby,
  },
  {
    id: 5,
    name: "Healthcare",
    icon: Stethoscope,
  },
  {
    id: 6,
    name: "Immunity",
    icon: ShieldPlus,
  },
];

export interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
}
