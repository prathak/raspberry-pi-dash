import { NextResponse } from "next/server";

interface MealPlan {
  day: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

// Store in memory - replace with SQLite for persistence
let mealPlans: MealPlan[] = [
  { day: "Monday", breakfast: "Oatmeal with berries", lunch: "Chicken salad", dinner: "Salmon with vegetables" },
  { day: "Tuesday", breakfast: "Scrambled eggs", lunch: "Turkey sandwich", dinner: "Pasta with tomato sauce" },
  { day: "Wednesday", breakfast: "Yogurt with granola", lunch: "Soup and bread", dinner: "Stir-fry with rice" },
  { day: "Thursday", breakfast: "Smoothie bowl", lunch: "Caesar salad", dinner: "Roast chicken with potatoes" },
  { day: "Friday", breakfast: "Pancakes", lunch: "Sushi", dinner: "Pizza night" },
  { day: "Saturday", breakfast: "Full English", lunch: "Leftovers", dinner: "BBQ" },
  { day: "Sunday", breakfast: "Avocado toast", lunch: "Roast dinner", dinner: "Light soup" },
];

export async function GET() {
  return NextResponse.json(mealPlans);
}

export async function POST(request: Request) {
  const body: MealPlan[] = await request.json();
  mealPlans = body;
  return NextResponse.json(mealPlans);
}

export async function PUT(request: Request) {
  const body: MealPlan = await request.json();
  const index = mealPlans.findIndex((m) => m.day === body.day);
  if (index !== -1) {
    mealPlans[index] = { ...mealPlans[index], ...body };
  }
  return NextResponse.json(mealPlans);
}
