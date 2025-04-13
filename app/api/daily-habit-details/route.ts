import { NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    // Extract query parameters: clerkId (user identifier) and date (YYYY-MM-DD)
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");
    const date = url.searchParams.get("date");

    if (!clerkId || !date) {
      return NextResponse.json({ error: "clerkId and date are required" }, { status: 400 });
    }

    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Find all habits for the specified user.
    const habits = await db.collection("habitcollectons").find({ clerkUserId: clerkId }).toArray();

    // Total expected completions is simply the number of habits (assuming one completion per habit per day).
    const totalExpected = habits.length;
    let totalCompleted = 0;

    habits.forEach((habit: any) => {
      // Check if the habit's completedDays array contains the specified date.
      if (habit.completedDays && Array.isArray(habit.completedDays)) {
        const isCompleted = habit.completedDays.some((cd: any) => cd.date === date);
        if (isCompleted) totalCompleted += 1;
      }
    });

    const missed = totalExpected - totalCompleted;

    return NextResponse.json(
      { date, totalExpected, totalCompleted, missed },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching daily habit details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
