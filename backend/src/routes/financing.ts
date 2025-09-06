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


router.post('/generate-range', async (req, res) => {
  const from = String(req.query.from || '');
  const to = String(req.query.to || '');
  const m = from.match(/^(\d{4})-(\d{2})$/);
  const n = to.match(/^(\d{4})-(\d{2})$/);
  if (!m || !n) return res.status(400).json({ error: 'from/to must be YYYY-MM' });
  const y0 = Number(m[1]); const M0 = Number(m[2]);
  const y1 = Number(n[1]); const M1 = Number(n[2]);
  const span = (y1 - y0) * 12 + (M1 - M0);
  if (span < 0) return res.status(400).json({ error: 'to must be >= from' });

  const fins = await Financing.find({ isActive: true }).lean();
  let insertedNew = 0;

  function lastDay(year:number, month:number){ return new Date(year, month, 0).getDate(); }

  for (let k = 0; k <= span; k++) {
    const y = y0 + Math.floor((M0 - 1 + k) / 12);
    const mth = ((M0 - 1 + k) % 12) + 1;

    for (const f of fins as any[]) {
      const start = new Date(f.startDate);
      const diff = (y - start.getFullYear()) * 12 + (mth - (start.getMonth()+1));
      if (diff < 0) continue;
      if (f.totalInstallments && diff >= f.totalInstallments) continue;

      const dom = Math.min(start.getDate(), lastDay(y, mth));
      const date = new Date(y, mth - 1, dom);

      const filter:any = {
        year: y, month: mth,
        type: 'EXPENSE',
        linkedFinancing: f._id,
        description: `${f.name} - Parcela`,
        isFixed: true,
      };
      const update:any = {
        $setOnInsert: {
          date,
          category: f.category || 'Financiamentos',
          plannedAmount: f.installmentAmount,
          account: f.account,
          status: 'PLANNED',
        }
      };
      const ret = await Transaction.updateOne(filter, update, { upsert: true });
      if ((ret as any).upsertedCount === 1) insertedNew += 1;
    }
  }

  res.json({ insertedNew });
});
