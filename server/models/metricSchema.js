import mongoose from "mongoose";

// FLEXIBLE model: users define their own trackable entities
// e.g., { name: "Study Hours", unit: "hours", type: "number" }
//       { name: "LeetCode Problems", unit: "problems", type: "count" }
//       { name: "Morning Run", unit: "km", type: "number" }
const metricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },       // user-defined metric name
  unit: { type: String, required: true },       // e.g., "hours", "problems", "reps"
  type: {
    type: String,
    enum: ["number", "count", "boolean", "duration"],
    default: "number",
  },                                            // unique data type specification
  color: { type: String, default: "#4f46e5" },  // chart color
  isPublic: { type: Boolean, default: true },   // shared on public profile
}, { timestamps: true });

export default mongoose.model("Metric", metricSchema);
