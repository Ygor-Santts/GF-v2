import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';
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
}


// Auto-pay: mark PLANNED transactions whose date <= today as PAID at 03:00 daily
import Transaction from './models/Transaction';

async function autoPayDue() {
  const now = new Date();
  // Normalize to end of today 23:59:59 to be safe
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const due = await Transaction.find({ status: 'PLANNED', date: { $lte: endToday } }).lean();
  for (const t of due as any[]) {
    const amount = t.amount ?? t.plannedAmount ?? 0;
    await Transaction.findByIdAndUpdate(t._id, { status: 'PAID', amount });
  }
  if (due.length) console.log(`[autoPayDue] Marked ${due.length} as PAID`);
}

// Run daily at 03:00 server local time
if (process.env.AUTO_PAY_CRON !== 'false') {
cron.schedule('0 3 * * *', () => {
  autoPayDue().catch(err => console.error('autoPayDue error', err));
});
