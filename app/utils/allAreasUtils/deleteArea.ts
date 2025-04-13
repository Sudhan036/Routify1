import AllHabits from "@/app/Pages/AllHabits/AllHabits"; 
import { iconToText } from "@/app/Pages/AllHabits/Components/IconsWindow/IconData";
import { AreaType, HabitType } from "@/app/Types/GlobalTypes";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

// Helper to update a habit in MongoDB
async function updateHabitInMongoDB(habit: HabitType) {
  try {
    const response = await fetch(`/api/habits?habitId=${habit._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: habit.name,
        icon: habit.icon,
        frequency: habit.frequency,
        notificationTime: habit.notificationTime,
        isNotificationOn: habit.isNotificationOn,
        areas: habit.areas,
        completedDays: habit.completedDays,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || "Something went wrong while updating habit");
    }
  } catch (error) {
    toast.error("Something went wrong while updating habit");
  }
}

// Helper to delete a habit from MongoDB by ID
async function deleteHabitById(habitId: string) {
  try {
    const response = await fetch(`/api/habits`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ habitId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete habit with id:", habitId, errorData.message);
    } else {
      console.log("Habit deleted with id:", habitId);
    }
  } catch (error) {
    console.error("Error deleting habit with id:", habitId, error);
  }
}

export async function deleteArea(
  selectedArea: AreaType,
  allAreas: AreaType[],
  setAllAreas: Dispatch<SetStateAction<AreaType[]>>,
  allHabits: HabitType[],
  setAllHabits: Dispatch<SetStateAction<HabitType[]>>
) {
  try {
    // Remove the selected area from the list of areas
    const updatedAreas: AreaType[] = allAreas.filter(
      (area) => area._id !== selectedArea._id
    );

    // Process each habit: remove the deleted area.
    // If a habit ends up with no areas after removal, delete that habit.
    const updatedHabits: HabitType[] = [];
    for (const habit of allHabits) {
      if (habit.areas.some((area) => area._id === selectedArea._id)) {
        const newAreas = habit.areas.filter(
          (area) => area._id !== selectedArea._id
        );

        if (newAreas.length === 0) {
          // Habit now has no area—delete it from the database.
          if (habit._id) {
            await deleteHabitById(habit._id);
          }
          // Do not push this habit into updatedHabits (it’s deleted)
        } else {
          // Habit still has one or more areas—update it.
          const updatedHabit = { ...habit, areas: newAreas };
          await updateHabitInMongoDB(updatedHabit);
          updatedHabits.push(updatedHabit);
        }
      } else {
        // Habit did not belong to the deleted area—keep it as is.
        updatedHabits.push(habit);
      }
    }

    // Delete the area via the API
    const response = await fetch(`/api/areas`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId: selectedArea._id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting area:", errorData.message);
      return { success: false, message: errorData.message };
    }

    const data = await response.json();
    toast.success("Area has been deleted successfully");
    setAllAreas(updatedAreas);
    setAllHabits(updatedHabits);
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
}
