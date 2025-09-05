import Recurring from '../models/Recurring';
import Financing from '../models/Financing';
import Transaction from '../models/Transaction';

/** returns month index distance from y0/m0 to y1/m1 (inclusive 0 for same month) */
function monthDiff(y0:number, m0:number, y1:number, m1:number) {
  return (y1 - y0) * 12 + (m1 - m0);
}

export async function ensureMonth(year: number, month: number) {
  // ---- Recorrentes (infinito por padrão; com installments para limitar) ----
  const recs = await Recurring.find({ isActive: true }).lean();
  for (const r of recs as any[]) {
    const start = r.startDate ? new Date(r.startDate) : null;
    const startY = start ? start.getFullYear() : year;
    const startM = start ? (start.getMonth() + 1) : month;
    const diff = start ? monthDiff(startY, startM, year, month) : 0;
    if (start && diff < 0) continue; // mês anterior ao início

    // limite de parcelas (opcional)
    if (r.installments && r.installments > 0 && diff >= r.installments) continue;

    // data de cobrança: usa dayOfMonth ou dia do startDate
    const dayRef = (r.dayOfMonth && r.dayOfMonth > 0) ? r.dayOfMonth : (start ? start.getDate() : 1);
    const lastDay = new Date(year, month, 0).getDate();
    const dom = Math.min(dayRef, lastDay);
    const date = new Date(year, month - 1, dom);

    const filter:any = {
      year, month,
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
    await Transaction.updateOne(filter, update, { upsert: true });
  }

  // ---- Financiamentos (respeita totalInstallments) ----
  const fins = await Financing.find({ isActive: true }).lean();
  for (const f of fins as any[]) {
    const start = new Date(f.startDate);
    const diff = monthDiff(start.getFullYear(), start.getMonth()+1, year, month);
    if (diff < 0) continue;
    if (f.totalInstallments && diff >= f.totalInstallments) continue;

    const lastDay = new Date(year, month, 0).getDate();
    const dom = Math.min(start.getDate(), lastDay);
    const date = new Date(year, month - 1, dom);

    const filter:any = {
      year, month,
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
    await Transaction.updateOne(filter, update, { upsert: true });
  }
}
