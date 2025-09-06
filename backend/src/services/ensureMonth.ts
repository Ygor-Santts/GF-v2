import Recurring from '../models/Recurring';
import Financing from '../models/Financing';
import Transaction from '../models/Transaction';

function monthDiff(y0:number, m0:number, y1:number, m1:number) {
  return (y1 - y0) * 12 + (m1 - m0);
}
function lastDay(y:number, m:number){ return new Date(y, m, 0).getDate(); }

export async function ensureMonth(year: number, month: number) {
  const recs = await Recurring.find({ isActive: true }).lean();
  for (const r of recs as any[]) {
    const start = r.startDate ? new Date(r.startDate) : null;
    const sY = start ? start.getFullYear() : year;
    const sM = start ? start.getMonth()+1 : month;
    const diff = start ? monthDiff(sY, sM, year, month) : 0;
    if (start && diff < 0) continue;
    if (r.installments && r.installments > 0 && diff >= r.installments) continue;
    if (r.endDate) {
      const e = new Date(r.endDate);
      const beyond = monthDiff(year, month, e.getFullYear(), e.getMonth()+1) > 0;
      if (beyond) continue;
    }

    const dayRef = r.dayOfMonth || (start ? start.getDate() : 1);
    const dom = Math.min(dayRef, lastDay(year, month));
    const date = new Date(year, month - 1, dom);

    await Transaction.updateOne(
      { year, month, type: r.type, category: r.category, description: r.name, isFixed: true },
      { $setOnInsert: { date, plannedAmount: r.amount, account: r.account, status: 'PLANNED' } },
      { upsert: true }
    );
  }

  const fins = await Financing.find({ isActive: true }).lean();
  for (const f of fins as any[]) {
    const start = new Date(f.startDate);
    const diff = monthDiff(start.getFullYear(), start.getMonth()+1, year, month);
    if (diff < 0) continue;
    if (f.totalInstallments && diff >= f.totalInstallments) continue;

    const dom = Math.min(start.getDate(), lastDay(year, month));
    const date = new Date(year, month - 1, dom);

    await Transaction.updateOne(
      { year, month, type: 'EXPENSE', linkedFinancing: f._id, description: `${f.name} - Parcela`, isFixed: true },
      { $setOnInsert: { date, category: f.category || 'Financiamentos', plannedAmount: f.installmentAmount, account: f.account, status: 'PLANNED' } },
      { upsert: true }
    );
  }
}

export async function seedRecurringForward(rec: any, monthsAhead = 24) {
  const start = rec.startDate ? new Date(rec.startDate) : new Date();
  const sY = start.getFullYear(); const sM = start.getMonth()+1;

  for (let k = 0; k <= monthsAhead; k++) {
    const y = sY + Math.floor((sM - 1 + k) / 12);
    const m = ((sM - 1 + k) % 12) + 1;

    if (rec.installments && rec.installments > 0 && k >= rec.installments) break;
    if (rec.endDate) {
      const e = new Date(rec.endDate);
      const over = (y > e.getFullYear()) || (y === e.getFullYear() && m > (e.getMonth()+1));
      if (over) break;
    }

    const dayRef = rec.dayOfMonth || start.getDate();
    const dom = Math.min(dayRef, new Date(y, m, 0).getDate());
    const date = new Date(y, m - 1, dom);

    await Transaction.updateOne(
      { year: y, month: m, type: rec.type, category: rec.category, description: rec.name, isFixed: true },
      { $setOnInsert: { date, plannedAmount: rec.amount, account: rec.account, status: 'PLANNED' } },
      { upsert: true }
    );
  }
}
