import mongoose from "mongoose";

// A daily log entry for a given metric
const entrySchema = new mongoose.Schema({
  metricId: { type: mongoose.Schema.Types.ObjectId, ref: "Metric", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  value: { type: Number, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" format for easy querying
  note: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
