"use client";

import React, { useState } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import UserManagement from "../Pages/UserManagement/UserManagement";
import HabitAnalyticsDashboard from "../Pages/HabitAnalytics/HabitAnalyticsDashboard";

export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  // State to track which tab is selected
  const [selectedTab, setSelectedTab] = useState<"user-management" | "habit-analytics">("user-management");

  if (!isLoaded) {
    return <p className="p-4">Loading...</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Admin Sign In</h1>
        <SignIn path="/admin" routing="path" signUpUrl="/admin" />
      </div>
    );
  }

  // Adjust this logic to match your admin authentication
  const adminEmail = "nadarsudhan4@gmail.com";
  if (user.emailAddresses[0].emailAddress !== adminEmail) {
    return (
      <div className="p-6 flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl font-semibold">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-500">Welcome, {user.firstName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setSelectedTab("user-management")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              selectedTab === "user-management" ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setSelectedTab("habit-analytics")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              selectedTab === "habit-analytics" ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            Habit Analytics
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hello, {user.firstName}!</span>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedTab === "user-management" && (
            <section className="mb-8 bg-white shadow rounded p-6">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-sm text-gray-500 mb-4">
                Manage all users, ban/unban or delete them if needed.
              </p>
              <UserManagement />
            </section>
          )}

          {selectedTab === "habit-analytics" && (
            <section className="bg-white shadow rounded p-6">
              <h2 className="text-2xl font-bold mb-4">Habit Analytics Dashboard</h2>
              <p className="text-sm text-gray-500 mb-4">
                View overall habit statistics and user activity.
              </p>
              <HabitAnalyticsDashboard />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
