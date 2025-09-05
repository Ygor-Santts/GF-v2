import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import transactions from './routes/transactions';
import recurring from './routes/recurring';
import financing from './routes/financing';
import reports from './routes/reports';

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(morgan('dev'));

app.use('/api/transactions', transactions);
app.use('/api/recurring', recurring);
app.use('/api/financing', financing);
app.use('/api/reports', reports);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestao_financeira';

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Mongo connect error', err);
  process.exit(1);
});
