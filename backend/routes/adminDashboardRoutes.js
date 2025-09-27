import express from 'express';
import { verifyToken, checkRole } from '../middleware/verifyToken.js';
import { getAdminDashboardSummary } from '../controllers/adminDashboardController.js';

const AdminDashboardRouter = express.Router();

AdminDashboardRouter.get('/summary', verifyToken, checkRole('admin'), getAdminDashboardSummary);

export default AdminDashboardRouter;