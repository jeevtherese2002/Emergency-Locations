import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  selectedIcon: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);
