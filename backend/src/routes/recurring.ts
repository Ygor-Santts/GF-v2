import { Router } from 'express';
import { z } from 'zod';
import Recurring from '../models/Recurring';
import Transaction from '../models/Transaction';

const router = Router();

const recurringSchema = z.object({
  name: z.string(),
  type: z.enum(['INCOME','EXPENSE']),
  category: z.string(),
  amount: z.number(),
  dayOfMonth: z.number().min(1).max(31),
  account: z.string().optional(),
  isActive: z.boolean().optional(),
    endDate: z.string().nullable().optional(),
  installments: z.number().int().positive().nullable().optional(),
  });

router.get('/', async (_req, res) => {
  const list = await Recurring.find().lean();
  res.json(list);
});

router.post('/', async (req, res) => {
  const parsed = recurringSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const doc = await Recurring.create({
    ...parsed.data,
    startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
  } as any);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = recurringSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const updated = await Recurring.findByIdAndUpdate(id, parsed.data, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Recurring.findByIdAndDelete(id);
  res.status(204).send();
});

router.post('/generate', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'year and month are required' });

  const recs = await Recurring.find({ isActive: true }).lean();
  let upserts = 0;

  for (const r of recs as any[]) {
    const day = Math.min(r.dayOfMonth, new Date(year, month, 0).getDate());
    const date = new Date(year, month - 1, day);

    const filter = {
      year, month,
      type: r.type,
      category: r.category,
      description: r.name,
      isFixed: true,
    };

    const update = {
      $setOnInsert: {
        date,
        account: r.account,
        plannedAmount: r.amount,
        status: 'PLANNED',
      }
    };

    const ret = await Transaction.updateOne(filter as any, update as any, { upsert: true });
    if ((ret as any).upsertedCount === 1) upserts += 1;
  }

  res.json({ createdOrKept: recs.length, insertedNew: upserts });
});

export default router;
