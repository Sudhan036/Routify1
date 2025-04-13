// habitSchema.ts
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the sub-schemas for the nested types
const FrequencySchema = new Schema({
  type: { type: String, required: true },       // e.g., "daily" or "weekly"
  days: { type: [String], required: true },     // e.g., ["Mo", "Tu", "We"] or all 7 for daily
  number: { type: Number, required: true },     // Not shown in your code, but in original schema
});

const AreaSchema = new Schema({
  _id: { type: String, required: false },
  icon: { type: String, required: true },
  name: { type: String, required: true },
});

const CompletedDaySchema = new Schema({
  _id: { type: String, required: false },
  date: { type: String, required: true },
});

// Define the main HabitType schema
const HabitSchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  clerkUserId: { type: String, required: true },
  frequency: { type: [FrequencySchema], required: true },
  notificationTime: { type: String },   // e.g., "8:00 AM"
  isNotificationOn: { type: Boolean, required: true },
  areas: { type: [AreaSchema], required: true, default: [] },
  completedDays: { type: [CompletedDaySchema], required: true, default: [] },
});

const HabitsCollection =
  mongoose.models.HabitsCollection ||
  mongoose.model("HabitsCollection", HabitSchema);

export default HabitsCollection;
