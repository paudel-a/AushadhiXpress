export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetch("http://localhost:5000/api/categories");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}
