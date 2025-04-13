// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Count total users (if any user data exists)
    const totalUsers = await db.collection("users").countDocuments({});

    // Count total habits from your habits collection.
    // Update the collection name if necessary (e.g., "habits" or "habitcollectons").
    const totalHabits = await db.collection("areas").countDocuments({});

    // Aggregate top three habits by grouping by "name"
    const topHabitsAgg = await db.collection("areas").aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]).toArray();
    const topHabits = topHabitsAgg.map((h: any) => ({
      habitName: h._id,
      count: h.count,
    }));

    return NextResponse.json({ totalUsers, totalHabits, topHabits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
