import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import AuthRouter from './routes/authRoutes.js';
import UserRouter from './routes/userRoutes.js';
import AdminRouter from './routes/adminRoutes.js';
import ServiceRouter from './routes/serviceRoutes.js';
import LocationRouter from './routes/locationRoutes.js';

dotenv.config({ quiet: true });
connectDB();

const app = express();
const fr_url = process.env.FRONTEND_URL ;

app.use(cors({ origin: fr_url, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.set('trust proxy', true);

app.use('/api/auth', AuthRouter);

app.use('/api/user', UserRouter);

app.use('/api/admin', AdminRouter);

app.use('/api/services', ServiceRouter);
app.use('/api/locations', LocationRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
