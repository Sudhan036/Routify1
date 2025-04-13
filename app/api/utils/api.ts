// /app/api/utils/api.ts

export const fetchHabits = async (clerkId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/habits?clerkId=${clerkId}`);
      const data = await res.json();
      console.log("Habits Data:", data); // Debug log
      if (res.ok) {
        return data.habits; // Ensure your /api/habits route returns an object with a habits property
      } else {
        throw new Error(data.error || 'Failed to fetch habits');
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  };
  
  export const fetchHabitInsights = async (clerkId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/habit-insights?clerkId=${clerkId}`);
      const data = await res.json();
      console.log("Habit Insights Data:", data); // Debug log
      if (res.ok) {
        return data.insights;
      } else {
        throw new Error(data.error || 'Failed to fetch habit insights');
      }
    } catch (error) {
      console.error("Error fetching habit insights:", error);
      throw error;
    }
  };
  