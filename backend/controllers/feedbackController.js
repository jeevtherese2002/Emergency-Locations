import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Location from "../models/Location.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

/**
 * USER SIDE
 * POST /api/feedback
 * Body: { locationId, rating, comment?, anonymous? }
 */
export const createFeedback = async (req, res) => {
    try {
        const userId = req.user._id;
        const { locationId, rating, comment, anonymous = false } = req.body;

        if (!locationId || !rating) {
            return res.status(400).json({ success: false, message: "locationId and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be 1-5" });
        }

        const location = await Location.findById(locationId).populate("serviceId", "_id");
        if (!location || location.isDisabled) {
            return res.status(404).json({ success: false, message: "Location not found or disabled" });
        }

        // Create
        const feedback = await Feedback.create({
            userId,
            locationId,
            serviceId: location.serviceId._id,
            rating,
            comment: comment?.trim(),
            anonymous: !!anonymous,
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted (pending moderation)",
            data: feedback,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You already submitted feedback for this location",
            });
        }
        console.error("createFeedback error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * USER SIDE (public)
 * GET /api/feedback/location/:locationId
 * Query: page=1 limit=10
 * Returns only approved feedback
 */
export const getFeedbackForLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        if (!mongoose.isValidObjectId(locationId)) {
            return res.status(400).json({ success: false, message: "Invalid locationId" });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        const match = { locationId, status: "approved" };

        const [items, total, agg] = await Promise.all([
            Feedback.find(match)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("rating comment anonymous createdAt userId")
                .populate("userId", "name")
                .lean(),
            Feedback.countDocuments(match),
            Feedback.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$locationId",
                        avgRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 },
                        breakdown: {
                            $push: "$rating"
                        }
                    }
                }
            ])
        ]);

        let ratingSummary = null;
        if (agg.length) {
            const breakdownCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            agg[0].breakdown.forEach(r => breakdownCounts[r]++);
            ratingSummary = {
                avgRating: Number(agg[0].avgRating.toFixed(2)),
                totalReviews: agg[0].totalReviews,
                breakdown: breakdownCounts
            };
        }

        // Prepare safe user display (respect anonymous)
        const safe = items.map(f => ({
            _id: f._id,
            rating: f.rating,
            comment: f.comment,
            createdAt: f.createdAt,
            userDisplay: f.anonymous ? "Anonymous" : f.userId?.name || "User",
        }));

        return res.json({
            success: true,
            page,
            pages: Math.ceil(total / limit),
            total,
            ratingSummary,
            data: safe,
        });
    } catch (error) {
        console.error("getFeedbackForLocation error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * USER SIDE
 * GET /api/feedback/locations/summary
 * Query: search=  serviceId=  page=  limit=
 * Returns paginated locations with aggregated approved feedback stats
 */
export const getLocationFeedbackSummary = async (req, res) => {
    try {
        const {
            search,
            serviceId,
            page = 1,
            limit = 12
        } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const lim = Math.min(parseInt(limit) || 12, 50);
        const skip = (pageNum - 1) * lim;

        // Build location base match
        const locMatch = { isDisabled: false };
        if (serviceId && mongoose.isValidObjectId(serviceId)) {
            locMatch.serviceId = new mongoose.Types.ObjectId(serviceId);
        }
        if (search?.trim()) {
            const s = search.trim();
            locMatch.$or = [
                { name: { $regex: s, $options: "i" } },
                { address: { $regex: s, $options: "i" } }
            ];
        }

        // Pipeline
        const pipeline = [
            { $match: locMatch },
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "service"
                }
            },
            { $unwind: "$service" },
            {
                $lookup: {
                    from: "feedbacks",
                    let: { locId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$locationId", "$$locId"] }, status: "approved" } },
                        {
                            $group: {
                                _id: null,
                                avgRating: { $avg: "$rating" },
                                totalReviews: { $sum: 1 }
                            }
                        }
                    ],
                    as: "feedbackStats"
                }
            },
            {
                $addFields: {
                    feedbackStats: {
                        $cond: [
                            { $gt: [{ $size: "$feedbackStats" }, 0] },
                            { $first: "$feedbackStats" },
                            { avgRating: null, totalReviews: 0 }
                        ]
                    }
                }
            },
            { $sort: { "feedbackStats.avgRating": -1, createdAt: -1 } },
            {
                $facet: {
                    results: [{ $skip: skip }, { $limit: lim }],
                    meta: [{ $count: "total" }]
                }
            }
        ];

        const agg = await Location.aggregate(pipeline);
        const results = agg[0].results;
        const total = agg[0].meta[0]?.total || 0;

        const data = results.map(r => ({
            locationId: r._id,
            name: r.name,
            address: r.address,
            service: {
                _id: r.service._id,
                name: r.service.name,
                icon: r.service.icon,
                color: r.service.color
            },
            avgRating: r.feedbackStats.avgRating ? Number(r.feedbackStats.avgRating.toFixed(2)) : null,
            totalReviews: r.feedbackStats.totalReviews
        }));

        return res.json({
            success: true,
            page: pageNum,
            pages: Math.ceil(total / lim),
            total,
            data
        });
    } catch (error) {
        console.error("getLocationFeedbackSummary error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * ADMIN SIDE
 * GET /api/admin/feedback
 * Query: search, status, flagged, serviceId, locationId, page, limit
 */
export const adminListFeedback = async (req, res) => {
    try {
        const {
            search,
            status,
            flagged,
            serviceId,
            locationId,
            page = 1,
            limit = 20
        } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const lim = Math.min(parseInt(limit) || 20, 100);
        const skip = (pageNum - 1) * lim;

        const match = {};

        if (status && ["pending", "approved", "removed"].includes(status)) {
            match.status = status;
        }
        if (flagged === "true") match.flagged = true;
        if (flagged === "false") match.flagged = false;

        if (serviceId && mongoose.isValidObjectId(serviceId)) {
            match.serviceId = new mongoose.Types.ObjectId(serviceId);
        }
        if (locationId && mongoose.isValidObjectId(locationId)) {
            match.locationId = new mongoose.Types.ObjectId(locationId);
        }

        // Search across comment, user name, location name, service name
        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as: "location"
                }
            },
            { $unwind: "$location" },
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "service"
                }
            },
            { $unwind: "$service" },
        ];

        if (search?.trim()) {
            const s = search.trim();
            pipeline.push({
                $match: {
                    $or: [
                        { comment: { $regex: s, $options: "i" } },
                        { "user.name": { $regex: s, $options: "i" } },
                        { "location.name": { $regex: s, $options: "i" } },
                        { "service.name": { $regex: s, $options: "i" } },
                        { "location.address": { $regex: s, $options: "i" } },
                    ]
                }
            });
        }

        pipeline.push(
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    results: [{ $skip: skip }, { $limit: lim }],
                    meta: [{ $count: "total" }]
                }
            }
        );

        const agg = await Feedback.aggregate(pipeline);
        const results = agg[0].results;
        const total = agg[0].meta[0]?.total || 0;

        return res.json({
            success: true,
            page: pageNum,
            pages: Math.ceil(total / lim),
            total,
            data: results.map(r => ({
                _id: r._id,
                rating: r.rating,
                comment: r.comment,
                status: r.status,
                flagged: r.flagged,
                createdAt: r.createdAt,
                user: { _id: r.user._id, name: r.user.name, email: r.user.email },
                service: { _id: r.service._id, name: r.service.name },
                location: { _id: r.location._id, name: r.location.name, address: r.location.address }
            }))
        });
    } catch (error) {
        console.error("adminListFeedback error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * ADMIN SIDE
 * PATCH /api/admin/feedback/:id/status
 * Body: { status: 'approved' | 'removed' }
 */
export const adminUpdateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["approved", "removed"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        const updated = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error("adminUpdateFeedbackStatus error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * ADMIN SIDE
 * PATCH /api/admin/feedback/:id/flag
 * Body: { flagged: boolean }
 */
export const adminToggleFlag = async (req, res) => {
    try {
        const { id } = req.params;
        const { flagged } = req.body;
        const updated = await Feedback.findByIdAndUpdate(
            id,
            { flagged: !!flagged },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("adminToggleFlag error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * ADMIN SIDE
 * DELETE /api/admin/feedback/:id
 */
export const adminDeleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Feedback not found" });
        }
        res.json({ success: true, message: "Feedback deleted" });
    } catch (error) {
        console.error("adminDeleteFeedback error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};