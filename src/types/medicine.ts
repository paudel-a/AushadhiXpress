export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  manufacturer: string;
  requiresPrescription: boolean;
  imageUrl: string;
}
