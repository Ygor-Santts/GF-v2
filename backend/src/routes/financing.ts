import { Router } from 'express';
import { z } from 'zod';
import Financing from '../models/Financing';
import Transaction from '../models/Transaction';

const router = Router();

const finSchema = z.object({
  name: z.string(),
  installmentAmount: z.number().positive(),
  totalInstallments: z.number().int().positive(),
  startDate: z.string(),
  account: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res) => {
  res.json(await Financing.find().lean());
});

router.post('/', async (req, res) => {
  const parsed = finSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const doc = await Financing.create({ ...parsed.data, startDate: new Date(parsed.data.startDate) } as any);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = finSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const updated = await Financing.findByIdAndUpdate(id, parsed.data, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Financing.findByIdAndDelete(id);
  res.status(204).send();
});

router.post('/generate', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'year and month are required' });

  const fins = await Financing.find({ isActive: true }).lean();
  let upserts = 0;

  for (const f of fins as any[]) {
    const day = new Date(f.startDate).getDate();
    const dom = Math.min(day, new Date(year, month, 0).getDate());
    const date = new Date(year, month - 1, dom);

    const filter = {
      year, month,
      type: 'EXPENSE',
      linkedFinancing: f._id,
      description: `${f.name} - Parcela`,
      isFixed: true,
    };

    const update = {
      $setOnInsert: {
        date,
        category: f.category || 'Financiamentos',
        plannedAmount: f.installmentAmount,
        account: f.account,
        status: 'PLANNED',
      }
    };

    const ret = await Transaction.updateOne(filter as any, update as any, { upsert: true });
    if ((ret as any).upsertedCount === 1) upserts += 1;
  }

  res.json({ createdOrKept: fins.length, insertedNew: upserts });
});

export default router;
