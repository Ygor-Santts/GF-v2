import Transaction from '../models/Transaction';

export async function monthlyReport(year: number, month: number) {
  const filter = { year, month };
  const txs = await Transaction.find(filter).lean();

  let incomePlanned = 0, incomeReal = 0, expensePlanned = 0, expenseReal = 0;
  const byCategory: Record<string, { planned: number, real: number, type: 'INCOME'|'EXPENSE' }> = {};
  const byType: Record<'Fixed'|'Variable', { planned: number, real: number }> = {
    Fixed: { planned: 0, real: 0 },
    Variable: { planned: 0, real: 0 },
  };

  for (const t of txs as any[]) {
    const isIncome = t.type === 'INCOME';
    const planned = t.plannedAmount ?? 0;
    const real = t.amount ?? 0;

    if (isIncome) { incomePlanned += planned; incomeReal += real; }
    else { expensePlanned += planned; expenseReal += real; }

    const key = t.category || 'Outros';
    if (!byCategory[key]) byCategory[key] = { planned: 0, real: 0, type: t.type };
    byCategory[key].planned += planned;
    byCategory[key].real += real;

    const k2 = t.isFixed ? 'Fixed' : 'Variable';
    byType[k2].planned += planned;
    byType[k2].real += real;
  }

  const netPlanned = incomePlanned - expensePlanned;
  const netReal = incomeReal - expenseReal;
  const spendPct = incomeReal ? (expenseReal / incomeReal) * 100 : 0;

  return {
    year, month,
    incomePlanned, incomeReal,
    expensePlanned, expenseReal,
    netPlanned, netReal,
    spendPct,
    byCategory, byType,
    count: txs.length,
  };
}
