import { Router } from 'express';
import { z } from 'zod';
import Recurring from '../models/Recurring';
import { seedRecurringForward } from '../services/ensureMonth';

const router = Router();

const recurringSchema = z.object({
  name: z.string(),
  type: z.enum(['INCOME','EXPENSE']),
  category: z.string(),
  amount: z.number(),
  dayOfMonth: z.number().min(1).max(31),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  installments: z.number().int().positive().nullable().optional(),
  account: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res) => {
  const list = await Recurring.find().lean();
  res.json(list);
});

router.post('/', async (req, res) => {
  const parsed = recurringSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const payload: any = {
    ...parsed.data,
    startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
  };
  const doc = await Recurring.create(payload);
  await seedRecurringForward(doc); // auto-gera meses à frente
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = recurringSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const patch: any = { ...parsed.data };
  if (patch.startDate) patch.startDate = new Date(patch.startDate);
  if (patch.endDate !== undefined && patch.endDate !== null) patch.endDate = new Date(patch.endDate);
  const updated = await Recurring.findByIdAndUpdate(id, patch, { new: true });
  if (updated) await seedRecurringForward(updated); // re-semente
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Recurring.findByIdAndDelete(id);
  res.status(204).send();
});

export default router;
