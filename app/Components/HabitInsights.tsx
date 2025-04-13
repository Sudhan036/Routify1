"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const HabitInsights = () => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clerkId = "user_2t7iE7ouxXCYVN71x5F7ZHxzoHW"; // Use your clerkId

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:3000/api/habit-insights?clerkId=${clerkId}`
        );
        console.log("✅ API Response:", response.data); // Debugging log

        if (response.data?.insights?.length > 0) {
          setInsights(response.data.insights);
        } else {
          setError("No insights found.");
          setInsights([]);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to fetch habit insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [clerkId]);

  return (
    <div>
      <h2>Your Habit Insights</h2>

      {loading ? (
        <p>Loading insights...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : insights.length === 0 ? (
        <p>No insights found. Keep logging your habits!</p>
      ) : (
        <ul className="list-disc ml-6">
          {insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      )}

      {/* Debugging Output */}
      <pre className="mt-4 p-2 bg-gray-100 rounded">
        Debug Data: {JSON.stringify(insights, null, 2)}
      </pre>
    </div>
  );
};

export default HabitInsights;
