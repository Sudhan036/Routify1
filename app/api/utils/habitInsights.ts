// /app/api/utils/habitInsights.ts

// Define the type for frequency
type FrequencyType = {
    days: string[];
  };
  
  export const generateConsistencyInsight = (habit: any) => {
    const { name, frequency, completedDays } = habit;
    const insights: string[] = [];
  
    // Check for completed streaks
    const totalFrequencyDays = frequency.reduce((total: number, freq: FrequencyType) => total + freq.days.length, 0);
    const completedCount = completedDays.length;
  
    if (completedCount >= totalFrequencyDays) {
      insights.push(`Amazing! You've completed ${name} consistently on all its scheduled days. Keep it up!`);
    } else if (completedCount === 0) {
      insights.push(`Don't forget! Try to complete your ${name} habit. You got this!`);
    } else {
      insights.push(`Great job! You've completed ${name} on ${completedCount} of its scheduled days. Keep pushing for consistency!`);
    }
  
    // Add frequency-based insights
    frequency.forEach((freq: FrequencyType) => {
      const days = freq.days.join(", ");
      insights.push(`You have set ${name} to repeat on ${days}. Make sure to stay consistent!`);
    });
  
    // Track missed days
    const completedDates = completedDays.map((day: any) => day.date);
    const missedDays = frequency
      .flatMap((freq: FrequencyType) => freq.days)
      .filter((day: string) => !completedDates.includes(day));
  
    if (missedDays.length > 0) {
      insights.push(`You missed ${name} on the following scheduled days: ${missedDays.join(", ")}. Try to catch up!`);
    }
  
    return insights;
  };
  