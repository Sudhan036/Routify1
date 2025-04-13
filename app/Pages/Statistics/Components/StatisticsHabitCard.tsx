import { useState } from "react"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { defaultColor } from "@/colors";
import { useGlobalContextProvider } from "@/app/contextApi";
import { darkModeColor } from "@/colors";
import CalendarHeatmap from "react-calendar-heatmap";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { HabitType } from "@/app/Types/GlobalTypes";
import "react-calendar-heatmap/dist/styles.css";
import "@/app/styles/calendarHeatmap.css"; // Ensure you import the base styles
import { calculateStreak } from "./StatisticsBoard";

type DateData = {
  date: string;
  count: number;
};

function transformToDateData(habit: HabitType): DateData[] {
  console.log("habit.completedDays:", habit?.completedDays || "No completedDays data");

  if (!habit?.completedDays?.length) {
    return [];
  }

  const dateMap: { [date: string]: number } = {};

  habit.completedDays.forEach((day) => {
    if (day?.date) {
      dateMap[day.date] = (dateMap[day.date] || 0) + 1;
    }
  });

  return Object.keys(dateMap).map((date) => ({
    date,
    count: dateMap[date] ?? 0, // Ensure count is never NaN
  }));
}

const HabitHeatmap = ({ habit }: { habit: HabitType }) => {
  const dateData = transformToDateData(habit);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 6);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Invalid startDate or endDate");
  }

  return (
    <div className="flex justify-center">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={dateData}
        showMonthLabels={true}
        showWeekdayLabels={true}
        classForValue={(value) => {
          if (!value || typeof value.count !== "number" || isNaN(value.count)) {
            return "color-empty";
          }
          return value.count > 3 ? "color-scale-4" 
               : value.count > 2 ? "color-scale-3" 
               : value.count > 1 ? "color-scale-2" 
               : "color-scale-1";
        }}
      />
    </div>
  );
};

export default function StatisticsHabitCard({ habit }: { habit: HabitType }) {
  // Debug logs to inspect received habit data
  console.log("StatisticsHabitCard received habit:", habit);
  console.log("Habit ID:", habit?._id);
  console.log("Habit Name:", habit?.name);
  console.log("Completed Days:", habit?.completedDays);
  console.log("Completed Days Length:", habit?.completedDays?.length || 0);

  // Ensure completedDays is always an array
  const completedDays = habit?.completedDays ?? [];
  console.log("Fixed Completed Days Array:", completedDays);

  const [isExpanded, setIsExpanded] = useState(false);
  const {
    darkModeObject: { isDarkMode },
  } = useGlobalContextProvider();
  const recurringDaysText = habit.frequency?.[0]?.days?.join(",") || "No days set";

  function calculateConsistency(habit: HabitType): number {
    if (!completedDays.length) {
      return 0;
    }
  
    return (calculateStreak(habit) / completedDays.length) * 100 || 0;
  }

  return (
    <div
      style={{
        backgroundColor: isDarkMode
          ? darkModeColor.backgroundSlate
          : defaultColor.backgroundSlate,
        color: isDarkMode ? darkModeColor.textColor : "black",
      }}
      className="p-5 rounded-md m-3 mb-6"
    >
      {/* Icon + Habit name + notification + frequency */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          {/* Icon */}
          <div className="bg-customRed w-10 h-10 rounded-full p-3 flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faBook} />
          </div>
          {/* Habit Name */}
          <span>{habit.name}</span>
          {/* Notification */}
          {habit.isNotificationOn && (
            <span
              style={{
                backgroundColor: defaultColor[100],
                color: defaultColor.default,
              }}
              className="p-1 text-sm px-3 rounded-md"
            >
              {habit.notificationTime}
            </span>
          )}
        </div>
        {/* Frequency */}
        <div>
          <span className="text-gray-400">{recurringDaysText}</span>
        </div>
      </div>
      {/* Single card stats */}
      <div className="mt-5 p-2 grid grid-cols-3">
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="font-bold">{completedDays.length}</span>
          <span>Total</span>
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="font-bold">
            {calculateConsistency(habit).toFixed(0) || 0}%
          </span>
          <span>Consistency</span>
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="font-bold">{calculateStreak(habit)}</span>
          <span>Streaks</span>
        </div>
      </div>
      {/* Heatmap */}
      <div
        style={{
          backgroundColor: isDarkMode
            ? darkModeColor.backgroundSlate
            : defaultColor.backgroundSlate,
        }}
        className={`w-full mt-8 flex justify-center transition-all ${
          isExpanded ? "h-48" : "h-0"
        }`}
      >
        <div className={`w-[700px] ${isExpanded ? "block" : "hidden"}`}>
          <HabitHeatmap habit={habit} />
        </div>
      </div>
      {/* Arrow to expand the card */}
      <div className="flex justify-end mt-3">
        <FontAwesomeIcon
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer"
          icon={isExpanded ? faChevronUp : faChevronDown}
        />
      </div>
    </div>
  );
}
