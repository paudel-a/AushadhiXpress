import { ShieldCheck, UserRoundCheck, Truck, Clock3 } from "lucide-react";

export interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
}

export const benefits: Benefit[] = [
  {
    id: 1,
    title: "Genuine Medicines",
    description: "Quality-checked medicines sourced from trusted suppliers.",
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Licensed Pharmacists",
    description: "Get reliable guidance from qualified pharmacy professionals.",
    icon: UserRoundCheck,
  },
  {
    id: 3,
    title: "Fast Home Delivery",
    description: "Get your medicines delivered safely to your doorstep.",
    icon: Truck,
  },
  {
    id: 4,
    title: "24/7 Convenience",
    description: "Order your healthcare essentials whenever you need them.",
    icon: Clock3,
  },
];
