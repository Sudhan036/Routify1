import { Dispatch, SetStateAction } from "react";
import { HabitType, AreaType } from "@/app/Types/GlobalTypes";
import toast from "react-hot-toast";


export async function deleteHabit(
  allHabits: HabitType[],
  setAllHabits: Dispatch<SetStateAction<HabitType[]>>,
  selectedItem: AreaType | HabitType | null
) {
  // Ensure we have a valid habit with an _id
  if (!selectedItem || !selectedItem._id) {
    toast.error("No habit selected or invalid habit ID");
    return { success: false, message: "Invalid habit" };
  }
  
  try {
    // Filter the habit out of the local state immediately for optimistic UI update
    const updatedHabits: HabitType[] = allHabits.filter(
      (habit) => habit._id !== selectedItem._id
    );

    // Send DELETE request to your API to remove the habit from MongoDB
    const response = await fetch(`/api/habits`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ habitId: selectedItem._id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData.message);
      toast.error(errorData.message || "Failed to delete habit");
      return { success: false, message: errorData.message };
    }

    const data = await response.json();
    toast.success("Habit has been deleted successfully");
    // Update local state with the new list of habits
    setAllHabits(updatedHabits);
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error in deleteHabit:", error);
    toast.error("Something went wrong while deleting the habit");
    return { success: false, message: "Something went wrong" };
  }
}
