import { Router } from 'express';
import { z } from 'zod';
import Transaction from '../models/Transaction';

const router = Router();

const txSchema = z.object({
  date: z.string().or(z.date()),
  type: z.enum(['INCOME','EXPENSE']),
  category: z.string(),
  description: z.string().optional(),
  plannedAmount: z.number().optional(),
  amount: z.number().optional(),
  account: z.string().optional(),
  isFixed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['PLANNED','PAID']).optional(),
  linkedFinancing: z.string().nullish(),
});

router.get('/', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const filter: any = {};
  if (!isNaN(year)) filter.year = year;
  if (!isNaN(month)) filter.month = month;
  const txs = await Transaction.find(filter).sort({ date: 1 }).lean();
  res.json(txs);
});

router.post('/', async (req, res) => {
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const data = parsed.data as any;
  const d = new Date(data.date);
  const doc = await Transaction.create({
    ...data,
    date: d,
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  });
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = txSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const updated = await Transaction.findByIdAndUpdate(id, parsed.data, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Transaction.findByIdAndDelete(id);
  res.status(204).send();
});

export default router;
