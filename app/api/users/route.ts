// app/api/users/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://api.clerk.dev/v1/users", {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid API response structure");
    }

    const users = data.map((user: any) => ({
      id: user.id,
      email: user.email_addresses?.[0]?.email_address || "No email",
      firstName: user.first_name || "No name",
      banned: user.banned || false,
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, id, action, email, firstName } = await request.json();
    const uid = userId || id;

    // For saving user data, upsert into the "users" collection with isActive: true.
    if (action === "save") {
      if (!uid || !email || !firstName) {
        return NextResponse.json(
          { error: "Missing required fields for saving user data" },
          { status: 400 }
        );
      }
      await connectToDB();
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not established");
      }
      const result = await db.collection("users").updateOne(
        { _id: uid },
        { $set: { email, firstName, isActive: true, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json(
        { success: true, message: "User saved successfully", result },
        { status: 200 }
      );
    }

    // For other actions (ban, unban, delete), use Clerk's API.
    if (!uid || (action !== "ban" && action !== "unban" && action !== "delete")) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    let endpoint: string;
    let method: string;
    if (action === "ban") {
      endpoint = `https://api.clerk.dev/v1/users/${uid}/ban`;
      method = "POST";
    } else if (action === "unban") {
      endpoint = `https://api.clerk.dev/v1/users/${uid}/unban`;
      method = "POST";
    } else if (action === "delete") {
      endpoint = `https://api.clerk.dev/v1/users/${uid}`;
      method = "DELETE";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || `Failed to ${action} user` },
        { status: 500 }
      );
    }

    let message = "";
    if (action === "ban" || action === "unban") {
      message = `User ${action}ned successfully`;
    } else if (action === "delete") {
      message = "User deleted successfully";
    }

    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
