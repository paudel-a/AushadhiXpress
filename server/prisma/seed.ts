import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "Pain Relief",
    description: "Medicines and products for pain management.",
  },
  {
    name: "Heart Care",
    description: "Medicines and products for cardiovascular health.",
  },
  {
    name: "Diabetes",
    description: "Medicines and products for diabetes management.",
  },
  {
    name: "Baby Care",
    description: "Healthcare products and essentials for babies.",
  },
  {
    name: "Healthcare",
    description: "General healthcare medicines and products.",
  },
  {
    name: "Immunity",
    description: "Products supporting immune health.",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
      },
      create: category,
    });
  }

  console.log("Categories seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
