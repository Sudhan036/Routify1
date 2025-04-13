"use client";

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";

type DailyData = {
  date: string;
  totalExpected: number;
  totalCompleted: number;
  missed: number;
};

export default function DailyDetailPieChart({ clerkId, date }: { clerkId: string; date: string; }) {
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const res = await fetch(`/api/daily-habit-details?clerkId=${clerkId}&date=${date}`);
        if (!res.ok) throw new Error("Failed to fetch daily habit details");
        const data: DailyData = await res.json();
        setDailyData(data);
      } catch (error) {
        console.error("Error fetching daily data:", error);
        toast.error("Error fetching daily habit details");
      }
    };

    fetchDailyData();
  }, [clerkId, date]);

  useEffect(() => {
    if (!dailyData) return;
    const canvas = document.getElementById("dailyPieChart") as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(canvas, {
      type: "pie",
      data: {
        labels: ["Completed", "Missed"],
        datasets: [
          {
            data: [dailyData.totalCompleted, dailyData.missed],
            backgroundColor: ["rgba(0, 128, 0, 0.6)", "rgba(255, 0, 0, 0.6)"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [dailyData]);

  if (!dailyData) return <p>Loading daily details...</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Daily Habit Details for {dailyData.date}</h2>
      <p>Total Expected: {dailyData.totalExpected}</p>
      <p>Total Completed: {dailyData.totalCompleted}</p>
      <p>Missed: {dailyData.missed}</p>
      <canvas id="dailyPieChart" width="400" height="300"></canvas>
    </div>
  );
}
