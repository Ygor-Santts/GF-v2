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


router.post('/generate-range', async (req, res) => {
  // Accepts JSON body: { from: 'YYYY-MM', to: 'YYYY-MM' }
  const { from, to } = req.body || {};
  if (!from || !/^\d{4}-\d{2}$/.test(from) || !to || !/^\d{4}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: "Provide { from: 'YYYY-MM', to: 'YYYY-MM' }" });
  }
  const [fy, fm] = from.split('-').map((v:string)=>Number(v));
  const [ty, tm] = to.split('-').map((v:string)=>Number(v));
  if (isNaN(fy) || isNaN(fm) || isNaN(ty) || isNaN(tm)) {
    return res.status(400).json({ error: 'Invalid from/to' });
  }
  // helper
  const monthDiff = (y0:number,m0:number,y1:number,m1:number)=> (y1-y0)*12 + (m1-m0);
  const steps = monthDiff(fy,fm,ty,tm);
  if (steps < 0) return res.status(400).json({ error: 'from must be <= to' });

  const recs = await Recurring.find({ isActive: true }).lean();
  let upserts = 0;

  for (let k=0; k<=steps; k++) {
    const y = fy + Math.floor((fm-1 + k)/12);
    const m = ((fm-1 + k) % 12) + 1;

    // For each month loop recs and upsert (same logic as /generate)
    for (const r of recs as any[]) {
      // respect startDate/installments if present
      const start = r.startDate ? new Date(r.startDate) : null;
      const startY = start ? start.getFullYear() : y;
      const startM = start ? (start.getMonth()+1) : m;
      const diff = start ? ((y - startY) * 12 + (m - startM)) : 0;
      if (start && diff < 0) continue;
      if (r.installments && r.installments > 0 && diff >= r.installments) continue;

      const dayRef = (r.dayOfMonth && r.dayOfMonth > 0) ? r.dayOfMonth : (start ? start.getDate() : 1);
      const lastDay = new Date(y, m, 0).getDate();
      const dom = Math.min(dayRef, lastDay);
      const date = new Date(y, m - 1, dom);

      const filter:any = {
        year: y, month: m,
        type: r.type,
        category: r.category,
        description: r.name,
        isFixed: true,
      };
      const update:any = {
        $setOnInsert: {
          date,
          plannedAmount: r.amount,
          account: r.account,
          status: 'PLANNED',
        }
      };
      const ret = await Transaction.updateOne(filter, update, { upsert: true });
      if ((ret as any).upsertedCount === 1) upserts += 1;
    }
  }

  res.json({ insertedNew: upserts });
});


export default router;
