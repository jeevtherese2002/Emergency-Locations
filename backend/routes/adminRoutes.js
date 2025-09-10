import express from 'express';

import { baseDetails, changePassword, getMyAccount, updateMyAccount } from '../controllers/adminController.js';
import { verifyToken, checkRole } from '../middleware/verifyToken.js';

const AdminRouter = express.Router();

AdminRouter.get('/base-detail', verifyToken, checkRole('admin'), baseDetails);

AdminRouter.get('/my-account', verifyToken, checkRole('admin'), getMyAccount);
AdminRouter.put('/my-account/update', verifyToken, checkRole('admin'), updateMyAccount);
AdminRouter.put('/change-password', verifyToken, checkRole('admin'), changePassword);

export default AdminRouter;