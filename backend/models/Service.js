import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Service", serviceSchema);
