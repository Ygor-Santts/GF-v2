"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyReport = monthlyReport;
const Transaction_1 = __importDefault(require("../models/Transaction"));
async function monthlyReport(year, month) {
    const filter = { year, month };
    const txs = await Transaction_1.default.find(filter).lean();
    let incomePlanned = 0, incomeReal = 0, expensePlanned = 0, expenseReal = 0;
    const byCategory = {};
    const byType = {
        Fixed: { planned: 0, real: 0 },
        Variable: { planned: 0, real: 0 },
    };
    for (const t of txs) {
        const isIncome = t.type === 'INCOME';
        const planned = t.plannedAmount ?? 0;
        const real = t.amount ?? 0;
        if (isIncome) {
            incomePlanned += planned;
            incomeReal += real;
        }
        else {
            expensePlanned += planned;
            expenseReal += real;
        }
        const key = t.category || 'Outros';
        if (!byCategory[key])
            byCategory[key] = { planned: 0, real: 0, type: t.type };
        byCategory[key].planned += planned;
        byCategory[key].real += real;
        const k2 = t.isFixed ? 'Fixed' : 'Variable';
        byType[k2].planned += planned;
        byType[k2].real += real;
    }
    const netPlanned = incomePlanned - expensePlanned;
    const netReal = incomeReal - expenseReal;
    const spendPct = incomeReal ? (expenseReal / incomeReal) * 100 : 0;
    return { year, month, incomePlanned, incomeReal, expensePlanned, expenseReal, netPlanned, netReal, spendPct, byCategory, byType, count: txs.length };
}
