import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { connectToDb } from './config/connectDb.js';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import translationRoutes from './routes/translationRoutes.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: ['https://todo-react-for-node-js.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));
const authLimiter = rateLimit({
  windowMs: 10000,
  max: 5,
  message: { error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.get('/', (_, res) => {
  res.send('hello TODO API');
});

app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);
app.use('/translation', translationRoutes);
connectToDb();

app.listen(PORT, () => {
  console.log(`Server works ✔ on http://localhost:${PORT}`);
});
