// /src/SendNotification.ts
export function sendNotifications(habitName: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification("Habit Stacker", {
      body: `It's time to do your habit: ${habitName}`,
    });

    // Close the notification after a specified time (e.g., 10 seconds)
    setTimeout(() => {
      notification.close();
    }, 10000); // 10000 milliseconds = 10 seconds
  }
}
