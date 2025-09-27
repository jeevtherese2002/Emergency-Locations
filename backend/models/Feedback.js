import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // denormalized
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 1000 },
        anonymous: { type: Boolean, default: false },
        status: { type: String, enum: ["pending", "approved", "removed"], default: "pending", index: true },
        flagged: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

// Prevent duplicate feedback by same user for same location
feedbackSchema.index({ userId: 1, locationId: 1 }, { unique: true });

// For admin moderation queries
feedbackSchema.index({ serviceId: 1, locationId: 1, createdAt: -1 });
feedbackSchema.index({ flagged: 1, createdAt: -1 });

// Text search on comment
feedbackSchema.index({ comment: "text" });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;