import { NextResponse } from "next/server";
import connectToDB from "@/app/lib/conntectToDB"; // Ensure you have this function to connect to DB
import HabitsCollection from "@/app/Models/HabitSchema"; // Adjust if you use a different model for habits
import { Error } from "mongoose";

// POST: Create a new habit
export async function POST(req: Request) {
  try {
    const {
      name,
      icon,
      clerkUserId,
      frequency,
      notificationTime,
      isNotificationOn,
      areas,
      completedDays,
    } = await req.json();

    await connectToDB();

    const habit = new HabitsCollection({
      name,
      icon,
      clerkUserId,
      frequency,
      notificationTime,
      isNotificationOn,
      areas,
      completedDays,
    });

    const savedHabit = await habit.save();

    return NextResponse.json({ habit: savedHabit });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

// GET: Retrieve habits for a given clerkUserId
export async function GET(req: any) {
  try {
    const clerkId = req.nextUrl.searchParams.get("clerkId");
    await connectToDB();
    const habits = await HabitsCollection.find({ clerkUserId: clerkId });
    return NextResponse.json({ habits: habits });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

// DELETE: Delete a habit by ID
export async function DELETE(request: any) {
  try {
    const { habitId } = await request.json();
    const habitToDelete = await HabitsCollection.findOneAndDelete({ _id: habitId });
    if (!habitToDelete) {
      return NextResponse.json({ message: "habit not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

// PUT: Update a habit by ID
export async function PUT(request: any) {
  try {
    const habitId = request.nextUrl.searchParams.get("habitId");
    const {
      name,
      icon,
      frequency,
      notificationTime,
      isNotificationOn,
      areas,
      completedDays,
    } = await request.json();

    if (!habitId) {
      return NextResponse.json({ message: "Habit ID is required" }, { status: 400 });
    }

    await connectToDB();

    const updatedHabit = await HabitsCollection.findOneAndUpdate(
      { _id: habitId },
      {
        $set: {
          name,
          icon,
          frequency,
          notificationTime,
          isNotificationOn,
          areas,
          completedDays,
        },
      },
      { returnDocument: "after" }
    );

    console.log(updatedHabit);

    return NextResponse.json({
      message: "Habit has been updated successfully",
      habit: updatedHabit.value,
    });
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json({ message: "An error occurred while updating the habit" }, { status: 500 });
  }
}

// GETHabitInsights: Generate insights from habits
export async function GETHabitInsights(req: any) {
  try {
    const clerkId = req.nextUrl.searchParams.get("clerkId");
    await connectToDB();
    const habits = await HabitsCollection.find({ clerkUserId: clerkId });
    let insights: string[] = [];

    habits.forEach((habit: any) => {
      const completedDates = habit.completedDays.map((day: any) => day.date);
      const morningCount = completedDates.filter((date: string) =>
        date.includes("Morning")
      ).length;
      const eveningCount = completedDates.filter((date: string) =>
        date.includes("Evening")
      ).length;

      // Suggest switching if more completions occur in the evening
      if (morningCount < eveningCount) {
        insights.push(
          `You often miss ${habit.name} in the morning. Would you prefer to do it in the evening instead?`
        );
      }

      // Suggest a fixed reminder if completions are higher in the evening
      if (eveningCount > morningCount) {
        insights.push(
          `You tend to complete ${habit.name} more in the evening. How about setting a fixed evening reminder?`
        );
      }
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error fetching habit insights:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
