import { Router } from 'express';
import { z } from 'zod';
import Financing from '../models/Financing';

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

export default router;
