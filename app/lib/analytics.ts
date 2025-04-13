// app/lib/analytics.ts
import connectToDB from "@/app/lib/conntectToDB";
import mongoose from "mongoose";

export async function getAnalyticsData() {
  // Establish the connection using your Mongoose connection
  await connectToDB();

  // Retrieve the native MongoDB database from Mongoose.
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }

  // 1. Count active users from the "users" collection.
  const activeUsers = await db.collection("users").countDocuments({ isActive: true });

  // 2. Aggregate top habits from the "habits" collection.
  // This aggregation groups habits by their "name", counts them,
  // sorts in descending order, and limits the results to the top 3.
  const topHabitsAgg = await db.collection("habits").aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]).toArray();

  const topHabits = topHabitsAgg.map((h: any) => ({
    habitName: h._id,
    count: h.count,
  }));

  return {
    activeUsers,
    topHabits,
  };
}
