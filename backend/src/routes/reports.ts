import { Router } from 'express';
import { monthlyReport } from '../services/report';
import { ensureMonth } from '../services/ensureMonth';

const router = Router();

router.get('/monthly', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'year and month are required' });
  await ensureMonth(year, month);
  const data = await monthlyReport(year, month);
  res.json(data);
});

export default router;
