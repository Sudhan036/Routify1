"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Chart from "chart.js/auto";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

type Frequency = {
  type: string;
  days: string[];
  number: number;
};

type Habit = {
  _id: string;
  name: string;
  completedDays: Array<{ date: string }>;
  frequency?: Frequency[];
};

type DailyDetail = {
  totalExpected: number;
  totalCompleted: number;
  missed: number;
};

export default function HabitAnalyticsDashboard() {
  const { user, isLoaded } = useUser();

  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState<boolean>(false);

  // Calendar & Pie chart
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dailyDetail, setDailyDetail] = useState<DailyDetail | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartRefPie = useRef<Chart | null>(null);

  // 1. Fetch habits for logged-in user
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchUserHabits = async () => {
      setLoadingHabits(true);
      try {
        const res = await fetch(`/api/habits?clerkId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch habits");
        const data = await res.json();
        setUserHabits(data.habits);
      } catch (error) {
        console.error("Error fetching habits:", error);
        toast.error("Error fetching habits");
      } finally {
        setLoadingHabits(false);
      }
    };
    fetchUserHabits();
  }, [user, isLoaded]);

  // 2. Compute daily detail when date changes
  useEffect(() => {
    if (!user || !selectedDate || loadingHabits) {
      if (chartRefPie.current) chartRefPie.current.destroy();
      setDailyDetail(null);
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const dayMap: Record<string, string> = {
      Mon: "Mo",
      Tue: "Tu",
      Wed: "We",
      Thu: "Th",
      Fri: "Fr",
      Sat: "Sa",
      Sun: "Su",
    };
    const dayAbbrev = dayMap[format(selectedDate, "eee")];

    const todaysHabits = userHabits.filter((habit) => {
      if (habit.frequency && habit.frequency.length > 0) {
        return habit.frequency[0].days.includes(dayAbbrev);
      }
      return true; // default daily
    });

    const totalExpected = todaysHabits.length;
    let totalCompleted = 0;
    todaysHabits.forEach((habit) => {
      if (habit.completedDays?.some((cd) => cd.date === formattedDate)) {
        totalCompleted += 1;
      }
    });
    const missed = totalExpected - totalCompleted;
    setDailyDetail({ totalExpected, totalCompleted, missed });
  }, [selectedDate, user, userHabits, loadingHabits]);

  // 3. Draw chart
  useEffect(() => {
    if (!dailyDetail) {
      if (chartRefPie.current) chartRefPie.current.destroy();
      return;
    }
    if (!pieChartRef.current) return;
    if (chartRefPie.current) chartRefPie.current.destroy();

    chartRefPie.current = new Chart(pieChartRef.current, {
      type: "pie",
      data: {
        labels: ["Completed", "Missed"],
        datasets: [
          {
            data: [dailyDetail.totalCompleted, dailyDetail.missed],
            backgroundColor: ["rgba(0,128,0,0.6)", "rgba(217,4,41,0.6)"],
            borderColor: ["#000", "#000"],
            borderWidth: 1,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } },
    });
  }, [dailyDetail]);

  if (!isLoaded) return <p>Loading dashboard...</p>;

  // Helper for last completion
  const getLastCompletedDate = (habit: Habit) => {
    if (!habit.completedDays || habit.completedDays.length === 0) return "N/A";
    const sortedDates = [...habit.completedDays].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return format(new Date(sortedDates[0].date), "yyyy-MM-dd");
  };

  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">
        Habit Analytics Dashboard
      </h1>

      {user && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Habit Activity for {user.firstName || "You"}
          </h2>

          {/* Habits Table */}
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Habit Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Total Completions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Last Completed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {userHabits.map((habit) => (
                  <tr key={habit._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{habit.name}</td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {habit.completedDays.length}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {getLastCompletedDate(habit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calendar & Pie Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col border border-red-300 p-4 rounded-md h-full">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiersStyles={{
                  selected: { backgroundColor: "#d90429", color: "white" },
                }}
              />
            </div>

            {selectedDate && dailyDetail && (
              <div className="flex flex-col bg-white border border-red-300 rounded-md p-4 h-full items-center justify-center">
                <h3 className="text-xl font-bold mb-2 text-center">
                  {format(selectedDate, "yyyy-MM-dd")}
                </h3>
                <p className="text-sm mb-2 text-center">
                  Each slice represents one habit scheduled for today.
                </p>
                <div className="w-64 h-64 flex items-center justify-center">
                  <canvas ref={pieChartRef} className="max-w-full max-h-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
