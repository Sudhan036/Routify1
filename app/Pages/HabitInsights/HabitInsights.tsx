"use client";

import React from "react";
import dayjs from "dayjs";

import { useGlobalContextProvider } from "@/app/contextApi";
import { generateConsistencyInsight } from "@/app/api/utils/habitInsights";
import { HabitType } from "@/app/Types/GlobalTypes";

/**
 * Helper function to check if a habit was completed today.
 * It assumes that each element in habit.completedDays is either:
 *   - a date string, or
 *   - an object with a "date" property.
 */
const isActiveToday = (habit: HabitType): boolean => {
  if (!habit.completedDays || !Array.isArray(habit.completedDays)) return false;

  return habit.completedDays.some((item: any) => {
    const dateStr = item.date || item;
    // Check if the date is the same as today's date.
    return dayjs(dateStr).isSame(dayjs(), "day");
  });
};

export default function HabitInsights() {
  const { allHabitsObject } = useGlobalContextProvider();
  const { allHabits } = allHabitsObject;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Habit Insights (Today: {dayjs().format("MMM D, YYYY")})
      </h1>

      {allHabits.length === 0 ? (
        <p>No habits available. Log some habits!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allHabits.map((habit: HabitType) => {
            // Generate additional insights
            const insights = generateConsistencyInsight(habit) || [];

            // Determine active status based on today's completion.
            const active = isActiveToday(habit);

            // Calculate today's completions count.
            const completionsToday = habit.completedDays
              ? habit.completedDays.filter((item: any) => {
                  const dateStr = item.date || item;
                  return dayjs(dateStr).isSame(dayjs(), "day");
                }).length
              : 0;

            return (
              <div
                key={habit._id}
                className="border border-gray-200 rounded-lg shadow bg-white p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{habit.name}</h2>
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded ${
                      active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm mb-1">
                  <strong>Notification Time:</strong> {habit.notificationTime}
                </p>

                <p className="text-sm mb-1">
                  <strong>Areas:</strong>{" "}
                  {habit.areas && habit.areas.length > 0
                    ? habit.areas.map((area: any) => area.name).join(", ")
                    : "No areas"}
                </p>

                <p className="text-sm mb-1">
                  <strong>Today's Completions:</strong> {completionsToday}
                </p>

                <div className="mt-2">
                  <h3 className="font-semibold">Insights:</h3>
                  {insights.length > 0 ? (
                    <ul className="list-disc ml-4 text-sm">
                      {insights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">No insights for this habit.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
