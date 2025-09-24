import mongoose from "mongoose";

const sosContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, unique: true, sparse: true },
  gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
  address: { type: String },
  profilePicture: { type: String },
  currentStatus: { type: String },
  dateofBirth: { type: Date },
  createdOn: { type: Date, default: Date.now },
  profileCompleted: { type: Boolean, default: false },
  sosContacts: { type: [sosContactSchema], default: [] },
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] }, // [longitude, latitude]
  },
  lastLocationAt: { type: Date },
});

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;