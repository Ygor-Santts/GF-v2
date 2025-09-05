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
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
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
  const fromYear = Number(req.query.year);
  const fromMonth = Number(req.query.month);
  const toYear = req.query.toYear ? Number(req.query.toYear) : undefined;
  const toMonth = req.query.toMonth ? Number(req.query.toMonth) : undefined;
  if (isNaN(fromYear) || isNaN(fromMonth)) return res.status(400).json({ error: 'year and month are required' });

  const recs = await Recurring.find({ isActive: true }).lean();

  const ymToNum = (y: number, m: number) => y * 12 + (m - 1);
  const clampDay = (y: number, m: number, d: number) => Math.min(d, new Date(y, m, 0).getDate());

  let totalCreated = 0;
  for (const r of recs as any[]) {
    const start: Date | undefined = r.startDate ? new Date(r.startDate) : undefined;
    const end: Date | null = r.endDate ? new Date(r.endDate) : null;

    const lowerYm = Math.max(
      ymToNum(fromYear, fromMonth),
      start ? ymToNum(start.getFullYear(), start.getMonth() + 1) : ymToNum(fromYear, fromMonth)
    );

    let upperYm: number;
    if (!isNaN(Number(toYear)) && !isNaN(Number(toMonth))) {
      upperYm = ymToNum(Number(toYear), Number(toMonth));
    } else if (end) {
      upperYm = ymToNum(end.getFullYear(), end.getMonth() + 1);
    } else {
      // default horizon: generate 12 months ahead
      const baseYm = ymToNum(fromYear, fromMonth);
      upperYm = baseYm + 11;
    }

    // if there is an endDate, cap at endDate
    if (end) upperYm = Math.min(upperYm, ymToNum(end.getFullYear(), end.getMonth() + 1));

    for (let ym = lowerYm; ym <= upperYm; ym++) {
      const y = Math.floor(ym / 12);
      const m = (ym % 12) + 1;

      // de-duplicate by linkedRecurring + month/year
      const exists = await Transaction.findOne({ linkedRecurring: r._id, year: y, month: m }).lean();
      if (exists) continue;

      const day = clampDay(y, m, r.dayOfMonth);
      const date = new Date(y, m - 1, day);

      await Transaction.create({
        date,
        month: m,
        year: y,
        type: r.type,
        category: r.category,
        description: r.name,
        plannedAmount: r.amount,
        account: r.account,
        isFixed: true,
        status: 'PLANNED' as const,
        linkedRecurring: r._id,
      });
      totalCreated += 1;
    }
  }

  res.json({ created: totalCreated });
});

export default router;
