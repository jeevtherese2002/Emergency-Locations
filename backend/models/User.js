 import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    mobile: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
    address: { type: String },
    profilePicture: { type: String },
    currentStatus: { type: String },
    dateofBirth: { type: Date },
    createdOn: { type: Date, default: Date.now },
    profileCompleted: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
