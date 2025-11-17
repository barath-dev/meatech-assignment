import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import trackingRoutes from './routes/trackingRoutes';
import { errorHandler } from './middleware/errorHandler';
import { limiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(limiter);

app.use('/register', authRoutes);
app.use('/login', authRoutes);
app.use('/habits', habitRoutes);
app.use('/habits', trackingRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
