"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SaveUserData() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // When the user is loaded and available, send a POST request
    if (isLoaded && user) {
      const payload = {
        userId: user.id,
        action: "save",
        email: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName,
      };

      // Send a POST request to /api/users to upsert the user document
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => console.log("User saved:", data))
        .catch((error) => console.error("Error saving user data:", error));
    }
  }, [user, isLoaded]);

  return null; // This component does not render anything visible.
}
