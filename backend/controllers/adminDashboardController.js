import User from '../models/User.js';
import Location from '../models/Location.js';
import Feedback from '../models/Feedback.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';

/**
 * GET /api/admin/dashboard/summary
 * Admin-only
 */
export const getAdminDashboardSummary = async (req, res) => {
    try {
        // Parallel base counts
        const [
            userCount,
            locationCount,
            feedbackCount,
        ] = await Promise.all([
            User.countDocuments({}),
            Location.countDocuments({ isDisabled: false }),
            Feedback.countDocuments({}),
        ]);

        // Reports today (using feedback as "reports")
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const reportsToday = await Feedback.countDocuments({ createdAt: { $gte: startOfToday } });

        // User growth last 12 months
        // Group by year-month from createdOn
        const userGrowthAgg = await User.aggregate([
            {
                $group: {
                    _id: {
                        y: { $year: '$createdOn' },
                        m: { $month: '$createdOn' }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.y': 1, '_id.m': 1 }
            }
        ]);

        // Build last 12 month window
        const now = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.push({
                key,
                label: d.toLocaleString('default', { month: 'short' }),
                realNewUsers: 0,
            });
        }
        // Map aggregated into months array
        userGrowthAgg.forEach(g => {
            const key = `${g._id.y}-${g._id.m}`;
            const slot = months.find(m => m.key === key);
            if (slot) {
                slot.realNewUsers = g.newUsers;
            }
        });
        // Dampening: cap month increment at 100
        let cumulative = 0;
        const userGrowth = months.map(m => {
            const dampened = Math.min(m.realNewUsers, 100);
            cumulative += dampened;
            return {
                month: m.label,
                newUsers: dampened,
                users: cumulative
            };
        });

        // Location distribution by serviceId (active only)
        const distributionAgg = await Location.aggregate([
            { $match: { isDisabled: false } },
            {
                $group: {
                    _id: '$serviceId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            { $unwind: '$service' },
            {
                $project: {
                    _id: 0,
                    serviceId: '$service._id',
                    name: '$service.name',
                    icon: '$service.icon',
                    color: '$service.color',
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Reports trend last 7 days (feedback as reports)
        const start7 = new Date();
        start7.setDate(start7.getDate() - 6);
        start7.setHours(0, 0, 0, 0);

        const rawReports = await Feedback.aggregate([
            { $match: { createdAt: { $gte: start7 } } },
            {
                $group: {
                    _id: {
                        y: { $year: '$createdAt' },
                        m: { $month: '$createdAt' },
                        d: { $dayOfMonth: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
        ]);

        // Build 7-day array
        const reportsTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const match = rawReports.find(r =>
                r._id.y === d.getFullYear() &&
                r._id.m === (d.getMonth() + 1) &&
                r._id.d === d.getDate()
            );
            reportsTrend.push({
                day: d.toLocaleDateString(undefined, { weekday: 'short' }),
                reports: match ? match.total : 0,
                resolved: match ? match.resolved : 0,
                pending: match ? match.pending : 0
            });
        }

        // Recent Users (last 5)
        const recentUsers = await User.find({})
            .sort({ createdOn: -1 })
            .limit(5)
            .select('name email createdOn')
            .lean();

        // Recent Feedback (last 5)
        const recentFeedback = await Feedback.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('createdAt status comment')
            .populate('userId', 'name')
            .populate('locationId', 'name')
            .lean();

        // Merge into activity list
        const recentActivity = [
            ...recentUsers.map(u => ({
                type: 'user',
                title: 'New user registration',
                actor: u.name,
                at: u.createdOn,
            })),
            ...recentFeedback.map(f => ({
                type: 'feedback',
                title: 'Feedback submitted',
                actor: f.userId?.name || 'User',
                at: f.createdAt,
                meta: {
                    location: f.locationId?.name,
                    status: f.status
                }
            }))
        ]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, 10);

        // Average response time – keeping static as requested
        const avgResponseTime = 2.4;

        return res.json({
            success: true,
            data: {
                userCount,
                activeUsers: userCount, // same as total
                locationCount,
                feedbackCount,
                reportsToday,
                avgResponseTime,
                userGrowth,
                reportsTrend,
                locationDistribution: distributionAgg,
                recentActivity
            }
        });
    } catch (error) {
        console.error('dashboard summary error', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};