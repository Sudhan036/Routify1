"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Chart from "chart.js/auto";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

type ActiveUser = {
  _id: string;
  email: string;
  firstName: string;
};

type Frequency = {
  type: string;
  days: string[]; // e.g., ["Mo", "Tu", "We"]
  number: number;
};

type Habit = {
  _id: string;
  name: string;
  completedDays: Array<{ date: string }>;
  frequency?: Frequency[]; // Use frequency field's days array for scheduling
};

type DailyDetail = {
  totalExpected: number;
  totalCompleted: number;
  missed: number;
};

export default function HabitAnalyticsDashboard() {
  const { user, isLoaded } = useUser();

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState<boolean>(true);
  const [loadingHabits, setLoadingHabits] = useState<boolean>(false);

  // For calendar & pie chart
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dailyDetail, setDailyDetail] = useState<DailyDetail | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartRefPie = useRef<Chart | null>(null);

  // 1. Fetch active users from /api/active-users
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch("/api/active-users");
        if (!res.ok) throw new Error("Failed to fetch active users");
        const data = await res.json();
        setActiveUsers(data.users);
      } catch (error) {
        console.error("Error fetching active users:", error);
        toast.error("Error fetching active users");
      } finally {
        setLoadingActiveUsers(false);
      }
    };
    fetchActiveUsers();
  }, []);

  // 2. When a user is selected, fetch that user's habits.
  useEffect(() => {
    if (!selectedUser) return;
    const fetchUserHabits = async () => {
      setLoadingHabits(true);
      try {
        const res = await fetch(`/api/habits?clerkId=${selectedUser._id}`);
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
    // Reset date and daily detail when switching users.
    setSelectedDate(undefined);
    setDailyDetail(null);
  }, [selectedUser]);

  // 3. Compute daily detail for the selected day using the existing frequency.days field.
  useEffect(() => {
    if (!selectedUser || !selectedDate || loadingHabits) {
      if (chartRefPie.current) chartRefPie.current.destroy();
      setDailyDetail(null);
      return;
    }
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Convert selected date to a day-of-week abbreviation matching your frequency.days format.
    // Assume your frequency.days are stored as two-letter abbreviations: "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su".
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

    // Filter habits based on frequency.days.
    const todaysHabits = userHabits.filter((habit) => {
      // If frequency exists and has at least one entry, use its days array.
      if (habit.frequency && habit.frequency.length > 0) {
        const frequencyDays = habit.frequency[0].days; // e.g., ["Mo", "Tu", "We"]
        return frequencyDays.includes(dayAbbrev);
      }
      // Otherwise, assume the habit is scheduled daily.
      return true;
    });

    // Now compute completions: count habits that have a completion on the selected date.
    const totalExpected = todaysHabits.length;
    let totalCompleted = 0;
    todaysHabits.forEach((habit) => {
      if (habit.completedDays?.some((cd) => cd.date === formattedDate)) {
        totalCompleted += 1;
      }
    });
    const missed = totalExpected - totalCompleted;
    setDailyDetail({ totalExpected, totalCompleted, missed });
  }, [selectedDate, selectedUser, userHabits, loadingHabits]);

  // 4. Render the pie chart once dailyDetail is computed.
  useEffect(() => {
    if (!dailyDetail) {
      if (chartRefPie.current) chartRefPie.current.destroy();
      return;
    }
    if (!pieChartRef.current) {
      console.error("Pie chart canvas element not found via ref");
      return;
    }
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
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }, [dailyDetail]);

  if (loadingActiveUsers || !isLoaded) {
    return <p>Loading dashboard...</p>;
  }

  // Helper: Get last completed date for each habit (for table display)
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

      {/* Active Users List */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Active Users</h2>
        <ul className="mt-2 space-y-2">
          {activeUsers.map((usr) => (
            <li
              key={usr._id}
              className={`p-2 cursor-pointer rounded-md hover:bg-red-100 ${
                selectedUser?._id === usr._id ? "bg-red-200" : "bg-white"
              }`}
              onClick={() => {
                setSelectedUser(usr);
                setSelectedDate(undefined);
              }}
            >
              <span className="font-medium">{usr.firstName}</span> ({usr.email})
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Habit Activity for {selectedUser.firstName}
          </h2>

          {/* Habit Table */}
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
                {userHabits.map((habit) => {
                  const totalCompletions = habit.completedDays.length;
                  const lastCompleted = getLastCompletedDate(habit);
                  return (
                    <tr key={habit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{habit.name}</td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {totalCompletions}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {lastCompleted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calendar & Pie Chart Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Calendar on Left */}
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

            {/* Pie Chart on Right */}
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
