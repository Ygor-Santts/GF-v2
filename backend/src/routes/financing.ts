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
  const fromYear = Number(req.query.year);
  const fromMonth = Number(req.query.month);
  const toYear = req.query.toYear ? Number(req.query.toYear) : undefined;
  const toMonth = req.query.toMonth ? Number(req.query.toMonth) : undefined;
  if (isNaN(fromYear) || isNaN(fromMonth)) return res.status(400).json({ error: 'year and month are required' });

  const fins = await Financing.find({ isActive: true }).lean();

  const ymToNum = (y: number, m: number) => y * 12 + (m - 1);
  const addMonths = (d: Date, months: number) => new Date(d.getFullYear(), d.getMonth() + months, d.getDate());

  let totalCreated = 0;
  for (const f of fins as any[]) {
    const start = new Date(f.startDate);
    const startYm = ymToNum(start.getFullYear(), start.getMonth() + 1);
    const lastDate = addMonths(start, f.totalInstallments - 1);
    const lastYm = ymToNum(lastDate.getFullYear(), lastDate.getMonth() + 1);

    const rangeStartYm = Math.max(ymToNum(fromYear, fromMonth), startYm);
    const rangeEndYm = (() => {
      if (!isNaN(Number(toYear)) && !isNaN(Number(toMonth))) {
        return Math.min(ymToNum(Number(toYear), Number(toMonth)), lastYm);
      }
      return lastYm;
    })();

    for (let ym = rangeStartYm; ym <= rangeEndYm; ym++) {
      const y = Math.floor(ym / 12);
      const m = (ym % 12) + 1;

      const exists = await Transaction.findOne({ linkedFinancing: f._id, year: y, month: m }).lean();
      if (exists) continue;

      const day = start.getDate();
      const daysInMonth = new Date(y, m, 0).getDate();
      const dom = Math.min(day, daysInMonth);
      const date = new Date(y, m - 1, dom);

      await Transaction.create({
        date, month: m, year: y,
        type: 'EXPENSE',
        category: f.category || 'Financiamentos',
        description: `${f.name} - Parcela`,
        plannedAmount: f.installmentAmount,
        isFixed: true,
        account: f.account,
        status: 'PLANNED',
        linkedFinancing: f._id,
      });
      totalCreated += 1;
    }
  }
  res.json({ created: totalCreated });
});

export default router;
