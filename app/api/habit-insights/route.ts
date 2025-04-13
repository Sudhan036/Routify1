import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB"; // Ensure your DB connection function works
import HabitsCollection from "@/app/Models/HabitSchema"; // Your Mongoose model
import { generateConsistencyInsight } from "@/app/api/utils/habitInsights"; // Your insights generator

export async function GET(req: NextRequest) {
  try {
    const clerkId = req.nextUrl.searchParams.get("clerkId"); // Get clerkId from query

    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    await connectToDB(); // Connect to DB

    // Fetch habits matching the clerkId
    const habits = await HabitsCollection.find({ clerkUserId: clerkId });

    if (habits.length === 0) {
      return NextResponse.json({ insights: [], message: "No habits found for this user" }, { status: 404 });
    }

    let insights: string[] = [];
    habits.forEach((habit: any) => {
      const habitInsights = generateConsistencyInsight(habit);
      insights = insights.concat(habitInsights);
    });

    // Return the insights with CORS headers
    return new NextResponse(
      JSON.stringify({ insights }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching habit insights:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
