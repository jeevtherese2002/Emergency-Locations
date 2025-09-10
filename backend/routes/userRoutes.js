import express from 'express';
import { baseDetails, completeProfile, getAccount, updateAccount, updatePassword } from '../controllers/userController.js';
import { uploadProfilePic } from '../middleware/uploadMiddleware.js';
import { verifyToken, checkRole } from '../middleware/verifyToken.js';

const UserRouter = express.Router();

UserRouter.get('/base-details', verifyToken, checkRole('user'), baseDetails);
UserRouter.post('/complete-profile', verifyToken, checkRole('user'), uploadProfilePic, completeProfile);
UserRouter.get('/my-account', verifyToken, checkRole('user'), getAccount);
UserRouter.put('/my-account', verifyToken, checkRole('user'), uploadProfilePic, updateAccount);
UserRouter.put('/change-password', verifyToken, checkRole('user'), updatePassword);


export default UserRouter;
