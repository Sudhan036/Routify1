"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Sidebar from "../Components/SideBar/Sidebar";
import { useGlobalContextProvider } from "../contextApi";
import { menuItemType } from "../Types/MenuItemType";
import Areas from "../Pages/Areas/Areas";
import AllHabits from "../Pages/AllHabits/AllHabits";
import Statistics from "../Pages/Statistics/Statistics";
import AllAreasContainer from "../Pages/Areas/Components/AllAreasContainer";
import HabitInsights from "../Pages/HabitInsights/HabitInsights";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { darkModeColor, defaultColor } from "@/colors";
import axios from "axios";

// Import the function that generates insights
import { generateConsistencyInsight } from "../api/utils/habitInsights";
// Import the fetchHabits function
import { fetchHabits } from "../api/utils/api";

function Dashboard() {
  const { menuItemsObject, darkModeObject } = useGlobalContextProvider();
  const { isDarkMode } = darkModeObject;
  const { menuItems } = menuItemsObject;
  const [selectedMenu, setSelectedMenu] = useState<menuItemType | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [habits, setHabits] = useState<any[]>([]);

  // Use Clerk's useUser hook to retrieve the user object
  const { user } = useUser();

  // Request Notification Permission
  const requestPermission = useCallback(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Permission is granted");
        }
      });
    }
  }, []);

  useEffect(() => {
    console.log("requesting permission");
    if ("Notification" in window) {
      requestPermission();
    }
  }, [requestPermission]);

  useEffect(() => {
    menuItems.forEach((singleItem) => {
      if (singleItem.isSelected) {
        setSelectedMenu(singleItem);
      }
    });
  }, [menuItems]);

  // Fetch Habit Insights and Habits Data on initial load
  useEffect(() => {
    const fetchData = async () => {
      const clerkUserId = user?.id;
      if (clerkUserId) {
        try {
          console.log("Fetching habits for user ID:", clerkUserId);
          // Fetch habits from backend
          const habitsData = await fetchHabits(clerkUserId);
          console.log("Fetched habits:", habitsData);

          if (!Array.isArray(habitsData) || habitsData.length === 0) {
            console.warn("No habits returned from the backend or invalid format.");
            setHabits([]);
            setInsights([]);
            return;
          }

          // Generate insights for each habit
          const habitInsights = habitsData
            .map((habit: any) => {
              if (
                habit &&
                Object.keys(habit).length > 0 &&
                (habit._id || habit.id)
              ) {
                console.log("Generating insight for habit:", habit);
                return generateConsistencyInsight(habit);
              }
              console.error("Invalid habit data:", habit);
              return [];
            })
            .flat();

          console.log("Generated insights:", habitInsights);
          setInsights(habitInsights);
          setHabits(habitsData);
        } catch (error: any) {
          // Using JSON.stringify to log the error details instead of [object Object]
          const errorMessage = error?.message ? error.message : JSON.stringify(error);
          console.error("Error fetching habits or generating insights:", errorMessage);
          setHabits([]);
          setInsights([]);
        }
      } else {
        console.warn("No clerkUserId found from Clerk user.");
      }
    };

    fetchData();
  }, [user]);

  // Render different components based on the selected menu item
  let selectComponent = null;
  switch (selectedMenu?.name) {
    case "All Habits":
      selectComponent = <AllHabits />;
      break;
    case "Statistics":
      selectComponent = <Statistics />;
      break;
    case "Areas":
      selectComponent = <Areas />;
      break;
    case "All Areas":
      selectComponent = <AllAreasContainer />;
      break;
    case "Habit Insights":
      selectComponent = <HabitInsights />;
      break;
    default:
      break;
  }

  return (
    <div
      style={{
        backgroundColor: isDarkMode
          ? darkModeColor.backgroundSlate
          : defaultColor.backgroundSlate,
      }}
      className="flex"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Sidebar />

        {/* Render the selected page/component */}
        {selectComponent}

        {/* 
          The "Your Habits" section has been removed.
          If you want to show it somewhere else, place the code there. 
        */}

        <BlackSoftLayer />
      </LocalizationProvider>
    </div>
  );
}

export default Dashboard;

// Define the BlackSoftLayer component within the same file
function BlackSoftLayer() {
  const {
    openSideBarObject,
    habitWindowObject,
    openConfirmationWindowObject,
    openAreaFormObject,
  } = useGlobalContextProvider();
  const { openSideBar } = openSideBarObject;
  const { openHabitWindow } = habitWindowObject;
  const { openConfirmationWindow } = openConfirmationWindowObject;
  const { openAreaForm } = openAreaFormObject;

  return (
    <div
      className={`w-full h-full bg-black fixed top-0 left-0 opacity-20 z-40 ${
        openSideBar || openHabitWindow || openConfirmationWindow || openAreaForm
          ? "fixed"
          : "hidden"
      }`}
    ></div>
  );
}
