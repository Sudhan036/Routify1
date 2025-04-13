// app/api/active-users/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    // Connect to MongoDB Atlas via Mongoose
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Query for active users
    const activeUsers = await db.collection("users").find({ isActive: true }).toArray();

    // Map the user documents to a simpler format
    const users = activeUsers.map((user: any) => ({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching active users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
