export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
}

export const medicines: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 120,
    rating: 4.8,
    image: "/medicines/paracetamol.jpg",
  },
  {
    id: 2,
    name: "Cetirizine 10mg",
    category: "Cold & Flu",
    price: 80,
    rating: 4.7,
    image: "/medicines/cetirizine.jpg",
  },
  {
    id: 3,
    name: "Vitamin C 500mg",
    category: "Vitamins",
    price: 250,
    rating: 4.9,
    image: "/medicines/vitamin-c.jpg",
  },
  {
    id: 4,
    name: "ORS Sachets",
    category: "Healthcare",
    price: 60,
    rating: 4.6,
    image: "/medicines/ors.jpg",
  },
];
